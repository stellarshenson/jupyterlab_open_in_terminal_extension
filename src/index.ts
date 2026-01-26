import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { showErrorMessage } from '@jupyterlab/apputils';
import { terminalIcon } from '@jupyterlab/ui-components';

/**
 * The command ID for opening a terminal at a directory.
 */
const COMMAND_ID = 'filebrowser:open-in-terminal';

/**
 * Initialization data for the jupyterlab_open_in_terminal_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_open_in_terminal_extension:plugin',
  description:
    'JupyterLab extension that adds context menu item to the file browser to open folder in terminal',
  autoStart: true,
  requires: [IDefaultFileBrowser],
  activate: (app: JupyterFrontEnd, fileBrowser: IDefaultFileBrowser) => {
    console.log(
      'JupyterLab extension jupyterlab_open_in_terminal_extension is activated!'
    );

    const { commands, serviceManager } = app;

    // Add the command
    commands.addCommand(COMMAND_ID, {
      label: 'Open in Terminal',
      caption: 'Open a terminal at this directory',
      icon: terminalIcon,
      isVisible: () => {
        // Only show for directories
        const item = fileBrowser.selectedItems().next();
        if (item.done || !item.value) {
          return false;
        }
        return item.value.type === 'directory';
      },
      execute: async () => {
        const item = fileBrowser.selectedItems().next();
        if (item.done || !item.value) {
          await showErrorMessage(
            'No Selection',
            'No folder selected in file browser.'
          );
          return;
        }

        const selectedItem = item.value;

        // Only allow directories
        if (selectedItem.type !== 'directory') {
          await showErrorMessage(
            'Not a Directory',
            'Please select a directory to open in terminal.'
          );
          return;
        }

        // Get the path - this is relative to the server root
        const relativePath = selectedItem.path;

        try {
          // Create a new terminal session with cwd set to the selected directory
          const session = await serviceManager.terminals.startNew({
            cwd: relativePath
          });

          // Create the terminal widget
          const terminal = await commands.execute('terminal:create-new', {
            name: session.name
          });

          if (!terminal) {
            // If terminal:create-new doesn't return the widget, try opening it
            await commands.execute('terminal:open', {
              name: session.name
            });
          }

          console.log(
            `Opened terminal "${session.name}" at path: ${relativePath}`
          );
        } catch (error) {
          console.error('Failed to open terminal:', error);
          await showErrorMessage(
            'Terminal Error',
            `Failed to open terminal at: ${relativePath}\nError: ${error}`
          );
        }
      }
    });

    // Add context menu item for directories in file browser
    app.contextMenu.addItem({
      command: COMMAND_ID,
      selector: '.jp-DirListing-item[data-isdir="true"]',
      rank: 3
    });

    console.log(`Command registered: ${COMMAND_ID}`);
  }
};

export default plugin;
