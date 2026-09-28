import { Plugin } from '@opencode/plugin/tui';

import { SliceWorkflowRpc } from './rpc.js';

export default Plugin.define({
  id: 'slice-workflow-tui',
  async setup(context) {
    const workflow = context.client.rpc(SliceWorkflowRpc);
    const location = context.location ?? context.data.location.default();
    return workflow.events.on('status', (event) => {
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
  },
});
