import { describe, expect, it } from 'vitest';

import { PINNED_AWS_VERSION } from '@/provider-version';

import manifest from '../package.json';

describe('When reading the pinned AWS provider version', () => {
  describe('and the root manifest declares the @pulumi/aws dependency', () => {
    it('should export the exact manifest pin as a nonempty string', () => {
      // ASSERT — no copied literal: the manifest is the only version record.
      expect(PINNED_AWS_VERSION).toBeTypeOf('string');
      expect(PINNED_AWS_VERSION).not.toBe('');
      expect(PINNED_AWS_VERSION).toBe(manifest.dependencies['@pulumi/aws']);
    });
  });
});
