import manifest from '../package.json';

/**
 * The exact `@pulumi/aws` version this framework is written against.
 *
 * Root `package.json` is the single source of truth for the pin, so there is
 * deliberately no copied literal here. A provider upgrade is a manifest plus
 * lockfile change, and `scripts/check-provider-version.mjs` (run by
 * `pnpm typecheck`) fails when the two sources disagree.
 */
export const PINNED_AWS_VERSION: string = manifest.dependencies['@pulumi/aws'];
