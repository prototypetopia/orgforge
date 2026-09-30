/**
 * Provider pin consistency guard.
 *
 * Root `package.json` is the canonical record of the pinned `@pulumi/aws`
 * version and `pnpm-lock.yaml` is the resolution evidence. This guard compares
 * the two structurally so that no code path can depend on a provider other
 * than the recorded one, and it never hardcodes the approved version: a
 * provider upgrade is a manifest plus lockfile change that this check re-reads.
 *
 * It runs from `pnpm typecheck` before `tsc --noEmit`, contacts no AWS API,
 * reads no environment variable, and resolves its inputs relative to the
 * repository root rather than the caller's working directory.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadAll } from 'js-yaml';

const PROVIDER = '@pulumi/aws';

// The `importers` / `packages` / `snapshots` lockfile layout this guard
// understands. Anything else is reported as an unsupported layout rather than
// guessed at.
const SUPPORTED_LOCKFILE_MAJOR = 9;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST_PATH = join(ROOT, 'package.json');
const LOCKFILE_PATH = join(ROOT, 'pnpm-lock.yaml');

// A bare semver version. Ranges, dist-tags, `npm:`/`workspace:`/`file:`
// aliases and links are deliberately excluded.
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const IMPORTER_SECTIONS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

function fail(message) {
  throw new Error(message);
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Strip a pnpm peer-dependency suffix. `7.48.0(ts-node@10.9.2)` and
 * `7.48.0` are the same provider version, not two versions.
 */
function baseVersion(lockEntry) {
  const cut = lockEntry.indexOf('(');
  return cut === -1 ? lockEntry : lockEntry.slice(0, cut);
}

function readManifest() {
  let text;
  try {
    text = readFileSync(MANIFEST_PATH, 'utf8');
  } catch {
    fail(`${MANIFEST_PATH} is missing or unreadable.`);
  }

  let manifest;
  try {
    manifest = JSON.parse(text);
  } catch (error) {
    fail(`${MANIFEST_PATH} is not valid JSON: ${error.message}`);
  }
  if (!isPlainObject(manifest)) {
    fail(`${MANIFEST_PATH} must contain a JSON object.`);
  }
  return manifest;
}

function readManifestPin(manifest) {
  const packageManager = manifest.packageManager;
  if (
    typeof packageManager !== 'string' ||
    !packageManager.startsWith('pnpm@')
  ) {
    fail(
      `${MANIFEST_PATH} must set "packageManager" to an exact "pnpm@<version>" ` +
        `string so the lockfile layout is reproducible.`
    );
  }

  const dependencies = manifest.dependencies;
  if (!isPlainObject(dependencies) || !(PROVIDER in dependencies)) {
    fail(
      `${MANIFEST_PATH} must declare ${PROVIDER} in "dependencies". The ` +
        `manifest is the provider version record; there is no second record.`
    );
  }

  const pin = dependencies[PROVIDER];
  if (typeof pin !== 'string' || pin.trim() === '') {
    fail(
      `${MANIFEST_PATH} "dependencies.${PROVIDER}" must be a nonempty exact ` +
        `version string.`
    );
  }
  if (!EXACT_VERSION.test(pin)) {
    fail(
      `${MANIFEST_PATH} "dependencies.${PROVIDER}" is "${pin}", which is not ` +
        `an exact version. Ranges, dist-tags, npm:/workspace:/file: aliases ` +
        `and links are rejected; pin one exact provider version.`
    );
  }
  return pin;
}

function readLockfileDocuments() {
  let text;
  try {
    text = readFileSync(LOCKFILE_PATH, 'utf8');
  } catch {
    fail(
      `${LOCKFILE_PATH} is missing or unreadable. The lockfile is the ` +
        `resolution evidence; regenerate and track it with the pinned pnpm ` +
        `version.`
    );
  }

  let documents;
  try {
    documents = loadAll(text);
  } catch (error) {
    fail(
      `${LOCKFILE_PATH} is not valid YAML: ${error.reason ?? error.message}`
    );
  }

  // pnpm 12 writes a multi-document lockfile, so every document is inspected.
  const parsed = documents.filter(
    (document) => document !== null && document !== undefined
  );
  if (parsed.length === 0) {
    fail(`${LOCKFILE_PATH} contains no YAML document.`);
  }
  for (const document of parsed) {
    if (!isPlainObject(document)) {
      fail(`${LOCKFILE_PATH} contains a non-mapping YAML document.`);
    }
    const version = document.lockfileVersion;
    if (typeof version !== 'string' || !/^\d+\.\d+$/.test(version)) {
      fail(
        `${LOCKFILE_PATH} has no usable "lockfileVersion". Regenerate it with ` +
          `the pnpm version pinned in ${MANIFEST_PATH} "packageManager".`
      );
    }
    if (Number(version.split('.')[0]) !== SUPPORTED_LOCKFILE_MAJOR) {
      fail(
        `${LOCKFILE_PATH} has lockfileVersion ${version}; this guard only ` +
          `understands the pnpm ${SUPPORTED_LOCKFILE_MAJOR} ` +
          `importers/packages/snapshots layout. Regenerate with the pinned ` +
          `pnpm version instead of checking in a lockfile from another major.`
      );
    }
  }
  return parsed;
}

function findRootImporterResolution(documents) {
  const found = [];
  for (const document of documents) {
    const importers = document.importers;
    if (!isPlainObject(importers)) {
      continue;
    }
    const root = importers['.'];
    if (!isPlainObject(root)) {
      continue;
    }
    for (const section of IMPORTER_SECTIONS) {
      const entries = root[section];
      if (isPlainObject(entries) && PROVIDER in entries) {
        found.push({ root, section });
      }
    }
  }

  if (found.length === 0) {
    fail(
      `${LOCKFILE_PATH} has no "importers['.']" entry resolving ${PROVIDER}. ` +
        `${MANIFEST_PATH} declares it as a direct runtime dependency, so the ` +
        `root importer must resolve it.`
    );
  }
  if (found.length > 1) {
    fail(
      `${LOCKFILE_PATH} resolves ${PROVIDER} from the root importer more than ` +
        `once (${found
          .map((entry) => entry.section)
          .join(', ')}). Exactly one direct root resolution is allowed.`
    );
  }

  const [only] = found;
  if (only.section !== 'dependencies') {
    fail(
      `${LOCKFILE_PATH} root importer lists ${PROVIDER} under ` +
        `"${only.section}", but ${MANIFEST_PATH} declares it under ` +
        `"dependencies". The pinned provider stays a direct dependency.`
    );
  }

  const entry = only.root[only.section][PROVIDER];
  if (!isPlainObject(entry)) {
    fail(
      `${LOCKFILE_PATH} "importers['.'].dependencies.${PROVIDER}" must be a ` +
        `mapping with "specifier" and "version".`
    );
  }
  return entry;
}

function checkRootResolution(entry, pin) {
  if (entry.specifier !== pin) {
    fail(
      `${LOCKFILE_PATH} records root specifier "${entry.specifier}" for ` +
        `${PROVIDER} but ${MANIFEST_PATH} pins "${pin}". Change the manifest ` +
        `and reinstall so both records move together.`
    );
  }

  if (typeof entry.version !== 'string' || entry.version === '') {
    fail(
      `${LOCKFILE_PATH} records no resolved root version for ${PROVIDER}; ` +
        `cannot confirm the lockfile matches the pin.`
    );
  }

  const resolved = baseVersion(entry.version);
  if (resolved !== pin) {
    fail(
      `${LOCKFILE_PATH} resolves ${PROVIDER} to "${resolved}" from the root ` +
        `importer but ${MANIFEST_PATH} pins "${pin}". Reinstall with the ` +
        `pinned version instead of hand-editing the lockfile.`
    );
  }
}

function checkSingleResolvedVersion(documents, pin) {
  const prefix = `${PROVIDER}@`;
  const locations = new Map();
  const providerSections = new Set();

  for (const document of documents) {
    for (const section of ['packages', 'snapshots']) {
      const entries = document[section];
      if (entries === undefined) {
        continue;
      }
      if (!isPlainObject(entries)) {
        fail(`${LOCKFILE_PATH} "${section}" must be a mapping of keys.`);
      }
      for (const key of Object.keys(entries)) {
        if (!key.startsWith(prefix)) {
          continue;
        }
        if (!isPlainObject(entries[key])) {
          fail(
            `${LOCKFILE_PATH} "${section}" entry "${key}" must be a mapping.`
          );
        }
        providerSections.add(section);
        const version = baseVersion(key.slice(prefix.length));
        if (!locations.has(version)) {
          locations.set(version, `${section} key "${key}"`);
        }
      }
    }
  }

  for (const section of ['packages', 'snapshots']) {
    if (!providerSections.has(section)) {
      fail(
        `${LOCKFILE_PATH} records no ${PROVIDER} entry in "${section}"; ` +
          `both package metadata and a dependency snapshot are required.`
      );
    }
  }

  const resolved = [...locations.keys()].sort();
  if (resolved.length > 1) {
    fail(
      `${PROVIDER} resolves to multiple versions in ${LOCKFILE_PATH}: ` +
        `${resolved.join(', ')}. One pinned provider version is required; ` +
        `deduplicate the lockfile instead of selecting the first match.`
    );
  }
  if (resolved[0] !== pin) {
    fail(
      `${LOCKFILE_PATH} resolves ${PROVIDER} to ${resolved[0]} ` +
        `(${locations.get(resolved[0])}) but ${MANIFEST_PATH} pins "${pin}". ` +
        `Change the manifest and reinstall with the pinned pnpm version.`
    );
  }
}

function main() {
  const manifest = readManifest();
  const pin = readManifestPin(manifest);
  const documents = readLockfileDocuments();
  checkRootResolution(findRootImporterResolution(documents), pin);
  checkSingleResolvedVersion(documents, pin);
  console.log(
    `check-provider-version: ${PROVIDER} is pinned to ${pin} in package.json ` +
      `and resolves to ${pin} in pnpm-lock.yaml.`
  );
}

try {
  main();
} catch (error) {
  console.error(`check-provider-version: ${error.message}`);
  process.exitCode = 1;
}
