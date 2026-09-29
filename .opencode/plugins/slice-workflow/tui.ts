import { Plugin } from '@opencode/plugin/tui';

import { SliceWorkflowRpc, TUI_HEARTBEAT_MS } from './rpc.js';

export default Plugin.define({
  id: 'slice-workflow-tui',
  async setup(context) {
    const workflow = context.client.rpc(SliceWorkflowRpc);
    const location = context.location ?? context.data.location.default();
    // A project plugin's RPC is only registered for its own location. Without
    // this the server resolves the service default location instead, replies
    // "rpc.unavailable", and every picker silently degrades to plain text.
    const target = { location };
    let warned = false;
    const announce = () =>
      workflow.tuiReady({}, target).then(
        () => {
          warned = false;
        },
        () => {
          if (warned) return;
          warned = true;
          context.ui.toast.show({
            title: 'Slice workflow',
            message:
              'Interactive pickers are unavailable; /slice-model will list models as text.',
            variant: 'warning',
          });
        }
      );

    // The host forgets this handshake whenever it reloads its own half of the
    // plugin, so keep re-announcing instead of announcing only at startup.
    void announce();
    const heartbeat = setInterval(() => void announce(), TUI_HEARTBEAT_MS);

    const offStatus = workflow.events.on('status', (event) => {
      if (event.location.directory !== location.directory) return;
      const status = event.data as {
        message: string;
        variant: 'info' | 'success' | 'warning' | 'error';
      };
      context.ui.toast.show({
        title: 'Slice workflow',
        message: status.message,
        variant: status.variant,
      });
    });

    const offPick = workflow.events.on('pick', (event) => {
      if (event.location.directory !== location.directory) return;
      const request = event.data as {
        options: { category?: string; description?: string; footer?: string; title: string }[];
        placeholder?: string;
        requestID: string;
        title: string;
      };
      const respond = (value?: string) => {
        void workflow
          .select({ requestID: request.requestID, value: value ?? '' }, target)
          .catch(() => {});
      };
      void context.ui.dialog
        .select<string>({
          title: request.title,
          placeholder: request.placeholder,
          options: request.options.map((option) => ({
            title: option.title,
            description: option.description,
            category: option.category,
            footer: option.footer,
            value: option.footer ?? option.title,
          })),
        })
        .then(respond, () => respond(undefined));
    });

    return () => {
      clearInterval(heartbeat);
      offStatus();
      offPick();
    };
  },
});
