// The pinned `@pulumi/aws` 7.48.0 exposes flat named exports plus one
// top-level namespace per service module; there is no `aws` wrapper namespace.
import { organizations } from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { beforeEach, describe, expect, it } from 'vitest';

interface RecordedResource {
  type: string;
  name: string;
  inputs: unknown;
}

let resources: RecordedResource[] = [];

// Resolve an Output to its plain value. setMocks returns plain values, but they
// surface as Outputs.
function promiseOf<T>(output: pulumi.Output<T>): Promise<T> {
  return new Promise((resolve) => output.apply(resolve));
}

// `setMocks` installs module-global runtime state, so one runtime configuration
// per file is the contract: this file only ever asserts that resources were
// created.
beforeEach(() => {
  resources = [];

  pulumi.runtime.setMocks(
    {
      newResource: (args: pulumi.runtime.MockResourceArgs) => {
        resources.push({
          type: args.type,
          name: args.name,
          inputs: args.inputs,
        });
        return {
          id: `${args.name}-id`,
          state: { ...args.inputs, arn: `arn:${args.name}` },
        };
      },
      call: (args: pulumi.runtime.MockCallArgs) => args.inputs,
    },
    'organization',
    'test',
    false
  );
});

describe('When constructing a Pulumi resource under the mock runtime', () => {
  describe('and no AWS credentials are configured', () => {
    it('should intercept construction and record the resource', async () => {
      // ARRANGE + ACT
      const organization = new organizations.Organization('Organization', {
        featureSet: 'ALL',
      });
      // Flush outputs: the URN resolves only once registration has completed.
      await promiseOf(organization.urn);

      // ASSERT
      const captured = resources.filter(
        (resource) =>
          resource.type === 'aws:organizations/organization:Organization'
      );
      expect(captured).toHaveLength(1);
      expect(captured[0].name).toBe('Organization');
      expect(captured[0].inputs).toMatchObject({ featureSet: 'ALL' });
    });
  });
});
