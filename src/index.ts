import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab_open_in_terminal_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_open_in_terminal_extension:plugin',
  description: 'Jupyterlab extension that adds item to the context menu in the file browser to open folder in terminal',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab_open_in_terminal_extension is activated!');
  }
};

export default plugin;
