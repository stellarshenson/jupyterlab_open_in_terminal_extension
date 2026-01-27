import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { showErrorMessage } from '@jupyterlab/apputils';
import { terminalIcon } from '@jupyterlab/ui-components';
import { PathExt } from '@jupyterlab/coreutils';

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
      label: 'Open Location in Terminal',
      caption: 'Open a terminal at this location',
      icon: terminalIcon,
      isVisible: () => {
        // Always visible - works for files, directories, and empty area
        return true;
      },
      execute: async () => {
        const item = fileBrowser.selectedItems().next();

        // Get the target path
        let targetPath: string;
        if (item.done || !item.value) {
          // No selection - use current directory from file browser
          targetPath = fileBrowser.model.path;
        } else {
          const selectedItem = item.value;
          if (selectedItem.type === 'directory') {
            targetPath = selectedItem.path;
          } else {
            // For files, get the parent directory
            targetPath = PathExt.dirname(selectedItem.path);
          }
        }

        try {
          // Create a new terminal session with cwd set to the target directory
          const session = await serviceManager.terminals.startNew({
            cwd: targetPath
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
            `Opened terminal "${session.name}" at path: ${targetPath}`
          );
        } catch (error) {
          console.error('Failed to open terminal:', error);
          await showErrorMessage(
            'Terminal Error',
            `Failed to open terminal at: ${targetPath}\nError: ${error}`
          );
        }
      }
    });

    // Add context menu item for file browser (works for files, folders, and empty area)
    app.contextMenu.addItem({
      command: COMMAND_ID,
      selector: '.jp-DirListing-content',
      rank: 3
    });

    console.log(`Command registered: ${COMMAND_ID}`);
  }
};

export default plugin;
