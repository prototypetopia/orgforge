import { Plugin } from '@opencode/plugin/tui';

import { SliceWorkflowRpc } from './rpc.js';

export default Plugin.define({
  id: 'slice-workflow-tui',
  async setup(context) {
    const workflow = context.client.rpc(SliceWorkflowRpc);
    const location = context.location ?? context.data.location.default();

    void workflow.tuiReady({}).catch(() => {});

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
          .select({ requestID: request.requestID, value: value ?? '' })
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
        .then(respond);
    });

    return () => {
      offStatus();
      offPick();
    };
  },
});
