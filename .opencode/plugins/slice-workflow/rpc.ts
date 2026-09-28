import { Rpc } from '@opencode/plugin/rpc';

export const SliceWorkflowRpc = Rpc.define({
  id: 'slice-workflow',
  methods: {},
  events: {
    status: {
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          sessionID: { type: 'string' },
          variant: {
            type: 'string',
            enum: ['info', 'success', 'warning', 'error'],
          },
        },
        required: ['message', 'sessionID', 'variant'],
        additionalProperties: false,
      },
    },
  },
});
