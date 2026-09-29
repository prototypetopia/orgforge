import { Rpc } from '@opencode/plugin/rpc';

const pickOption = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    category: { type: 'string' },
    footer: { type: 'string' },
  },
  required: ['title'],
  additionalProperties: false,
};

const empty = { type: 'object', properties: {}, additionalProperties: false };

export const SliceWorkflowRpc = Rpc.define({
  id: 'slice-workflow',
  methods: {
    tuiReady: {
      input: empty,
      output: empty,
    },
    select: {
      input: {
        type: 'object',
        properties: { requestID: { type: 'string' }, value: { type: 'string' } },
        required: ['requestID'],
        additionalProperties: false,
      },
      output: empty,
    },
  },
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
    pick: {
      schema: {
        type: 'object',
        properties: {
          requestID: { type: 'string' },
          title: { type: 'string' },
          placeholder: { type: 'string' },
          options: { type: 'array', items: pickOption },
        },
        required: ['requestID', 'title', 'options'],
        additionalProperties: false,
      },
    },
  },
});
