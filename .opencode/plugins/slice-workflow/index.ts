import { readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Plugin } from '@opencode/plugin';

import { SliceWorkflowRpc } from './rpc.js';

type LoopResult = 'CONTINUE' | 'WAITING_USER' | 'FAILED' | 'COMPLETE';
type LoopStatus = 'running' | 'submitting' | 'resuming' | 'waiting_user';

interface LoopState {
  args: string[];
  delivery?: 'steer' | 'queue';
  intervalMs: number;
  iterations: number;
  maxIterations: number;
  nextRunAt?: number;
  runID: string;
  sessionID: string;
  skill: string;
  status: LoopStatus;
  target: string;
}

interface WorkflowConfig {
  agents?: Record<string, { model?: string }>;
}

const DEFAULT_MAX_ITERATIONS = 100;
const MAX_TIMER_MS = 2_147_483_647;
const RESULT_PATTERN =
  /(?:^|\n)LOOP_RESULT: (CONTINUE|WAITING_USER|FAILED|COMPLETE); LOOP_RUN_ID: ([a-f0-9-]+)\s*$/;

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let quote: '"' | "'" | undefined;
  let token = '';
  let tokenStarted = false;

  for (let index = 0; index < input.trim().length; index += 1) {
    const character = input.trim()[index];
    if (character === '\\' && quote !== "'") {
      const next = input.trim()[index + 1];
      if (next && (/\s/.test(next) || next === '"' || next === "'" || next === '\\')) {
        token += next;
        tokenStarted = true;
        index += 1;
      } else {
        token += character;
        tokenStarted = true;
      }
      continue;
    }
    if (quote) {
      if (character === quote) quote = undefined;
      else token += character;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      tokenStarted = true;
      continue;
    }
    if (/\s/.test(character)) {
      if (tokenStarted) {
        tokens.push(token);
        token = '';
        tokenStarted = false;
      }
      continue;
    }
    token += character;
    tokenStarted = true;
  }

  if (quote) throw new Error('Unterminated quote in /loop arguments');
  if (tokenStarted) tokens.push(token);
  return tokens;
}

function parseDuration(value: string): number {
  const match = /^(\d+)(ms|s|m|h)$/.exec(value);
  if (!match) throw new Error(`Invalid loop interval: ${value}`);
  const multipliers = { ms: 1, s: 1_000, m: 60_000, h: 3_600_000 };
  const multiplier = multipliers[match[2] as keyof typeof multipliers];
  const duration = Number(match[1]) * multiplier;
  if (!Number.isSafeInteger(duration) || duration > MAX_TIMER_MS) {
    throw new Error(`Loop interval exceeds ${MAX_TIMER_MS}ms: ${value}`);
  }
  return duration;
}

function parseLoopStart(argumentsText: string) {
  const tokens = tokenize(argumentsText);
  let index = 0;
  let intervalMs = 0;
  let maxIterations = DEFAULT_MAX_ITERATIONS;

  while (tokens[index]?.startsWith('--')) {
    const option = tokens[index++];
    const value = tokens[index++];
    if (!value) throw new Error(`${option} requires a value`);
    if (option === '--interval') intervalMs = parseDuration(value);
    else if (option === '--max-iterations') {
      if (!/^[1-9]\d*$/.test(value)) throw new Error(`Invalid max iterations: ${value}`);
      maxIterations = Number(value);
      if (!Number.isSafeInteger(maxIterations)) {
        throw new Error(`Invalid max iterations: ${value}`);
      }
    } else throw new Error(`Unknown loop option: ${option}`);
  }

  const [slashSkill, ...args] = tokens.slice(index);
  if (!slashSkill?.startsWith('/') || slashSkill.length === 1) {
    throw new Error('Loop target must start with a slash-prefixed skill name');
  }

  return {
    args,
    intervalMs,
    maxIterations,
    skill: slashSkill.slice(1),
    target: [slashSkill, ...args.map((arg) => JSON.stringify(arg))].join(' '),
  };
}

function buildPrompt(state: LoopState): string {
  return [
    `Run iteration ${state.iterations} of the registered workflow.`,
    `Load the \`${state.skill}\` skill with the skill tool.`,
    `Execute it with this exact positional argument array: ${JSON.stringify(state.args)}.`,
    'Do not merely explain the skill. Perform exactly one workflow iteration.',
    'After the workflow produces its LOOP_RESULT status, emit this correlated form as your final nonblank line:',
    `LOOP_RESULT: <status>; LOOP_RUN_ID: ${state.runID}`,
  ].join('\n');
}

function getText(messages: readonly unknown[]): string {
  return messages
    .flatMap((message) => {
      const parts = (message as { parts?: unknown[] }).parts ?? [];
      return parts.flatMap((part) => {
        const text = (part as { text?: unknown }).text;
        return typeof text === 'string' ? [text] : [];
      });
    })
    .join('\n');
}

interface ModelSummary {
  cost?: { tier?: { size: number }; input: number; output: number }[];
  id: string;
  limit?: { context?: number };
  name?: string;
  providerID: string;
  status?: string;
  time?: { released?: number };
  variants?: { id: string }[];
}

interface PickOption {
  category?: string;
  description?: string;
  footer?: string;
  title: string;
}

const MAX_MODELS_PER_PROVIDER = 8;
const MAX_SHORTLIST_MODELS = 12;
const PICKER_TIMEOUT_MS = 120_000;

function modelRef(model: ModelSummary): string {
  return `${model.providerID}/${model.id}`;
}

function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '?';
  if (value === 0) return '0';
  if (value < 0.01) return value.toExponential(1);
  return value
    .toFixed(2)
    .replace(/0+$/, '')
    .replace(/\.$/, '');
}

function modelTitle(model: ModelSummary): string {
  const name = model.name?.trim();
  if (!name) return modelRef(model);
  return name.split(/\s+/).length <= 5 ? name : modelRef(model);
}

function modelHint(model: ModelSummary): string {
  const parts: string[] = [];
  const cost = model.cost?.[0];
  if (!cost) parts.push('price not listed');
  else if (cost.input === 0 && cost.output === 0) parts.push('free');
  else parts.push(`$${formatMoney(cost.input)} in / $${formatMoney(cost.output)} out per Mtok`);
  const tier = model.cost?.find((entry) => entry.tier)?.tier?.size;
  if (tier) parts.push(`higher price past ${Math.round(tier / 1_000)}K tokens`);
  if (model.limit?.context) parts.push(`${Math.round(model.limit.context / 1_000)}K context`);
  if (model.variants?.length) parts.push(`${model.variants.length} reasoning levels`);
  if (model.time?.released) parts.push(new Date(model.time.released).toISOString().slice(0, 7));
  return parts.join(' - ');
}

function disambiguateTitles(models: readonly ModelSummary[]): string[] {
  const counts = new Map<string, number>();
  for (const model of models) {
    const title = modelTitle(model);
    counts.set(title, (counts.get(title) ?? 0) + 1);
  }
  return models.map((model) => {
    const title = modelTitle(model);
    return (counts.get(title) ?? 0) > 1 ? `${title} (${model.providerID})` : title;
  });
}

function shortlistModels(entries: readonly unknown[]): ModelSummary[] {
  const byProvider = new Map<string, ModelSummary[]>();
  for (const entry of entries as readonly ModelSummary[]) {
    if (entry.status !== 'active') continue;
    const bucket = byProvider.get(entry.providerID);
    if (bucket) bucket.push(entry);
    else byProvider.set(entry.providerID, [entry]);
  }
  const ranked = [...byProvider.values()].flatMap((bucket) =>
    bucket
      .slice()
      .sort((a, b) => (b.time?.released ?? 0) - (a.time?.released ?? 0))
      .slice(0, MAX_MODELS_PER_PROVIDER)
  );
  return ranked
    .sort((a, b) => (b.time?.released ?? 0) - (a.time?.released ?? 0))
    .slice(0, MAX_SHORTLIST_MODELS);
}

function modelListText(models: readonly ModelSummary[]): string {
  if (models.length === 0) return 'No active models are available.';
  const titles = disambiguateTitles(models);
  return models
    .map(
      (model, index) =>
        `${titles[index]}\n    ${modelRef(model)}\n    ${modelHint(model)}`
    )
    .join('\n');
}

export default Plugin.define({
  id: 'slice-workflow',
  async setup(ctx) {
    let disposed = false;
    let tuiConnected = false;
    const timers = new Map<string, ReturnType<typeof setTimeout>>();
    const activeLoops = new Map<string, LoopState>();
    const pendingPicks = new Map<string, (value: string | undefined) => void>();
    const rpc = await ctx.rpc.register(SliceWorkflowRpc, {
      tuiReady: async () => {
        tuiConnected = true;
        return {};
      },
      select: async (input) => {
        const { requestID, value } = input as { requestID: string; value?: string };
        const settle = pendingPicks.get(requestID);
        if (settle) {
          pendingPicks.delete(requestID);
          settle(value || undefined);
        }
        return {};
      },
    });

    const isActive = (state: LoopState) => activeLoops.get(state.sessionID) === state;

    const requestPick = async (
      title: string,
      options: readonly PickOption[],
      placeholder?: string
    ): Promise<string | undefined> => {
      if (!tuiConnected || options.length === 0) return undefined;
      const requestID = crypto.randomUUID();
      let settle: (value: string | undefined) => void = () => {};
      const answer = new Promise<string | undefined>((resolve) => {
        settle = resolve;
      });
      pendingPicks.set(requestID, settle);
      const timer = setTimeout(() => {
        if (pendingPicks.delete(requestID)) settle(undefined);
      }, PICKER_TIMEOUT_MS);
      try {
        await rpc.events.emit('pick', { requestID, title, options, placeholder });
        return await answer;
      } catch {
        return undefined;
      } finally {
        clearTimeout(timer);
        pendingPicks.delete(requestID);
      }
    };

    const notify = async (
      sessionID: string,
      message: string,
      variant: 'info' | 'success' | 'warning' | 'error'
    ) => {
      await rpc.events.emit('status', { message, sessionID, variant });
    };

    const clear = (sessionID: string) => {
      const timer = timers.get(sessionID);
      if (timer) clearTimeout(timer);
      timers.delete(sessionID);
      activeLoops.delete(sessionID);
    };

    const fail = async (state: LoopState, message: string) => {
      clear(state.sessionID);
      await notify(state.sessionID, message, 'error');
      await ctx.session.synthetic({ sessionID: state.sessionID, text: message });
    };

    const submit = async (state: LoopState): Promise<boolean> => {
      if (!isActive(state)) return false;
      state.status = 'submitting';
      state.runID = crypto.randomUUID();
      try {
        await ctx.session.prompt({
          delivery: state.delivery,
          sessionID: state.sessionID,
          text: buildPrompt(state),
        });
        return true;
      } catch (error) {
        await fail(state, `Loop failed to submit ${state.target}: ${String(error)}`);
        return false;
      }
    };

    const submitNext = async (state: LoopState) => {
      if (disposed || !isActive(state)) return;
      if (state.iterations >= state.maxIterations) {
        clear(state.sessionID);
        await notify(
          state.sessionID,
          `Stopped after ${state.maxIterations} iterations: ${state.target}`,
          'warning'
        );
        return;
      }
      state.iterations += 1;
      await submit(state);
    };

    const scheduleNext = async (state: LoopState, delayMs: number) => {
      if (disposed || !isActive(state)) return;
      state.status = 'running';
      state.nextRunAt = Date.now() + delayMs;
      const existing = timers.get(state.sessionID);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(() => {
        void submitNext(state).catch(async (error) => {
          await fail(state, `Loop failed to continue ${state.target}: ${String(error)}`);
        });
      }, delayMs);
      timers.set(state.sessionID, timer);
    };

    const continueLoop = async (state: LoopState, result: LoopResult) => {
      if (disposed || !isActive(state)) return;
      if (result === 'COMPLETE' || result === 'FAILED') {
        clear(state.sessionID);
        await notify(
          state.sessionID,
          `${result === 'COMPLETE' ? 'Completed' : 'Failed'} ${state.target}`,
          result === 'COMPLETE' ? 'success' : 'error'
        );
        return;
      }
      if (result === 'WAITING_USER') {
        state.status = 'waiting_user';
        await notify(state.sessionID, `Waiting for input: ${state.target}`, 'warning');
        return;
      }
      await scheduleNext(state, state.intervalMs);
    };

    await ctx.command.transform((editor) => {
      editor.add({
        name: 'loop',
        description: 'Repeatedly run a workflow skill until it completes, waits for input, or fails',
        execute: async ({ delivery, prompt, sessionID }) => {
          const argumentsText = prompt.text.trim();
          const existing = activeLoops.get(sessionID);

          if (argumentsText === 'stop') {
            if (!existing) {
              await ctx.session.synthetic({ sessionID, text: 'No active loop in this session.' });
              await notify(sessionID, 'No active loop', 'info');
              return;
            }
            await ctx.session.interrupt({ sessionID, resume: false });
            clear(sessionID);
            await ctx.session.synthetic({ sessionID, text: 'Loop stopped.' });
            await notify(sessionID, 'Loop stopped', 'info');
            return;
          }

          if (existing) throw new Error('This session already has an active loop; run /loop stop first');

          const parsed = parseLoopStart(argumentsText);
          const state: LoopState = {
            ...parsed,
            delivery,
            iterations: 1,
            runID: crypto.randomUUID(),
            sessionID,
            status: 'running',
          };
          activeLoops.set(sessionID, state);
          if (await submit(state)) await notify(sessionID, `Started ${state.target}`, 'info');
        },
      });

      editor.add({
        name: 'slice-model',
        description: 'Assign a validated OpenCode model to a slice workflow role',
        execute: async ({ prompt, sessionID }) => {
          const argumentsList = tokenize(prompt.text);
          const roles = {
            design: ['slice-design-readonly', 'slice-design-edit'],
            implement: [
              'slice-implement-code',
              'slice-implement-tests',
              'slice-implement-docs',
            ],
            review: ['slice-review-fix', 'slice-review-audit'],
          } as const;
          const roleName = argumentsList[0];
          let model = argumentsList[1];

          if (roleName && !(roleName in roles)) {
            throw new Error('Role must be design, implement, or review');
          }
          if (argumentsList.length > 2) {
            throw new Error('Usage: /slice-model <design|implement|review> <provider/model[#variant]>');
          }

          const configPath = join(ctx.location.project.directory, '.opencode', 'opencode.json');
          const usage =
            'Usage: /slice-model <design|implement|review> <provider/model[#variant]>';

          let role = roleName;
          if (!role) {
            const config = JSON.parse(await readFile(configPath, 'utf8')) as WorkflowConfig;
            const assignments = Object.entries(roles)
              .map(([name, agentIDs]) => {
                const models = agentIDs.map(
                  (agentID) => config.agents?.[agentID]?.model ?? 'inherits parent'
                );
                return `${name}: ${[...new Set(models)].join(', ')}`;
              })
              .join('\n');
            const picked = await requestPick(
              'Assign a model to which slice role?',
              Object.entries(roles).map(([name, agentIDs]) => ({
                title: name,
                description: `Sets one model on ${agentIDs.join(', ')}`,
              }))
            );
            if (!picked || !(picked in roles)) {
              await ctx.session.synthetic({ sessionID, text: `${assignments}\n\n${usage}` });
              return;
            }
            role = picked;
          }

          const { data: available } = await ctx.model.list();
          const shortlist = shortlistModels(available);
          if (!model) {
            const titles = disambiguateTitles(shortlist);
            const picked = await requestPick(
              `Model for the ${role} role`,
              shortlist.map((entry, index) => ({
                category: entry.providerID,
                description: modelHint(entry),
                footer: modelRef(entry),
                title: titles[index],
              })),
              'provider/model'
            );
            if (!picked) {
              await ctx.session.synthetic({
                sessionID,
                text: `${modelListText(shortlist)}\n\nAssign with: /slice-model ${role} <provider/model[#variant]>`,
              });
              return;
            }
            model = picked;
          }

          const modelParts = model.split('#');
          if (modelParts.length > 2 || modelParts.some((part) => !part)) {
            throw new Error('Model must use provider/model[#variant] format');
          }
          const [modelReference, variant] = modelParts;
          const slashIndex = modelReference.indexOf('/');
          if (slashIndex < 1) throw new Error('Model must use provider/model[#variant] format');
          const providerID = modelReference.slice(0, slashIndex);
          const modelID = modelReference.slice(slashIndex + 1);
          const selected = available.find((entry) => {
            const candidate = entry as { id: string; providerID: string; variants?: { id: string }[] };
            return (
              candidate.providerID === providerID &&
              candidate.id === modelID &&
              (!variant || candidate.variants?.some((item) => item.id === variant))
            );
          });
          if (!selected) throw new Error(`Model is not available: ${model}`);

          const lockPath = `${configPath}.slice-model.lock`;
          const temporaryPath = `${configPath}.${crypto.randomUUID()}.tmp`;
          try {
            await writeFile(lockPath, '', { flag: 'wx' });
          } catch (error) {
            throw new Error(`Model assignment is locked: ${String(error)}`);
          }
          try {
            const original = await readFile(configPath, 'utf8');
            const config = JSON.parse(original) as WorkflowConfig;
            const agents = config.agents ?? {};
            for (const agentID of roles[role as keyof typeof roles]) {
              agents[agentID] = { ...agents[agentID], model };
            }
            config.agents = agents;

            const updatedConfig = `${JSON.stringify(config, null, 2)}\n`;
            await writeFile(temporaryPath, updatedConfig);
            if ((await readFile(configPath, 'utf8')) !== original) {
              throw new Error('Configuration changed during model assignment; no update was applied');
            }
            await rename(temporaryPath, configPath);
            await ctx.agent.reload();
            await ctx.session.synthetic({
              sessionID,
              text: `Assigned ${model} to the ${role} slice role. New child sessions use the updated model.`,
            });
          } finally {
            await rm(temporaryPath, { force: true });
            await rm(lockPath, { force: true });
          }
        },
      });
    });

    await ctx.session.hook('prompt', async (event) => {
      const sessionID = (event as { sessionID: string }).sessionID;
      const state = activeLoops.get(sessionID);
      if (!state || state.status !== 'waiting_user') return;

      state.status = 'resuming';
      event.prompt.text +=
        '\n\nAnswer the user normally, but do not execute the paused workflow in this turn. The loop resumes after this response.';
    });

    const handleIdle = async (sessionID: string) => {
      if (disposed) return;
      const state = activeLoops.get(sessionID);
      if (!state) return;
      if (state.status === 'resuming') {
        await scheduleNext(state, state.intervalMs);
        return;
      }
      if (state.status !== 'submitting') return;

      const messages = await ctx.session.context({ sessionID });
      if (disposed) return;
      const match = RESULT_PATTERN.exec(getText(messages));
      if (!match || match[2] !== state.runID) {
        clear(sessionID);
        await notify(
          sessionID,
          `Loop stopped: missing correlated LOOP_RESULT from ${state.target}.`,
          'error'
        );
        await ctx.session.synthetic({
          sessionID,
          text: `Loop stopped: missing correlated LOOP_RESULT from ${state.target}.`,
        });
        return;
      }
      await continueLoop(state, match[1] as LoopResult);
    };

    const controller = new AbortController();
    void (async () => {
      for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
        if (disposed) return;
        if (event.type !== 'session.idle') continue;
        const sessionID = (event as { properties?: { sessionID?: string } }).properties?.sessionID;
        if (!sessionID) continue;
        await handleIdle(sessionID).catch(async (error) => {
          if (disposed) return;
          const state = activeLoops.get(sessionID);
          if (state) await fail(state, `Loop failed while processing ${state.target}: ${String(error)}`);
          else await notify(sessionID, `Loop processing failed: ${String(error)}`, 'error');
        });
      }
    })().catch((error) => console.error('Slice workflow event subscription failed', error));

    return () => {
      disposed = true;
      controller.abort();
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      activeLoops.clear();
      for (const settle of pendingPicks.values()) settle(undefined);
      pendingPicks.clear();
    };
  },
});
