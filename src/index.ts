import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { showErrorMessage } from '@jupyterlab/apputils';
import { terminalIcon } from '@jupyterlab/ui-components';
import { PathExt } from '@jupyterlab/coreutils';

/**
 * The command ID for opening a terminal from a file or the empty browser area.
 *
 * JupyterLab core already provides `terminal:open-folder-in-terminal` for
 * folders (label "Open in Terminal"). This command complements it, reusing the
 * same label and the core `terminal:create-new` command, for the two cases core
 * does not cover: a selected file (opens its parent folder) and the empty file
 * browser area (opens the current folder).
 */
const COMMAND_ID = 'filebrowser:open-in-terminal';

/**
 * The core terminal creation command, reused to open the terminal.
 */
const CREATE_TERMINAL_COMMAND = 'terminal:create-new';

/**
 * Initialization data for the jupyterlab_open_in_terminal_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_open_in_terminal_extension:plugin',
  description:
    'Complements the built-in Open in Terminal command for files and the empty file browser area',
  autoStart: true,
  requires: [IDefaultFileBrowser],
  activate: (app: JupyterFrontEnd, fileBrowser: IDefaultFileBrowser) => {
    console.log(
      'JupyterLab extension jupyterlab_open_in_terminal_extension is activated!'
    );

    const { commands, serviceManager } = app;

    // Match core behaviour: do nothing if terminals are not available
    if (!serviceManager.terminals.isAvailable()) {
      return;
    }

    commands.addCommand(COMMAND_ID, {
      label: 'Open in Terminal',
      caption: 'Open a terminal at this location',
      icon: terminalIcon.bindprops({ stylesheet: 'menuItem' }),
      isVisible: () => {
        // Complement core only: hide on directories, which core already covers.
        // Shown for files and for the empty area (no selection).
        const item = fileBrowser.selectedItems().next();
        return item.done || !item.value || item.value.type !== 'directory';
      },
      execute: async () => {
        const item = fileBrowser.selectedItems().next();

        // Resolve the target directory relative to the server root
        const targetPath =
          item.done || !item.value
            ? fileBrowser.model.path // empty area - current folder
            : PathExt.dirname(item.value.path); // file - its parent folder

        try {
          // Reuse the core terminal command, exactly as the stock folder command does
          await commands.execute(CREATE_TERMINAL_COMMAND, { cwd: targetPath });
        } catch (error) {
          await showErrorMessage('Failed to open new terminal', error as Error);
        }
      }
    });

    // Register only where core does not: files and the empty browser area.
    // `.jp-DirListing-content` also matches folder items as an ancestor, but
    // isVisible hides the command on directories so core's item stays unique.
    app.contextMenu.addItem({
      command: COMMAND_ID,
      selector: '.jp-DirListing-content',
      rank: 3
    });

    console.log(`Command registered: ${COMMAND_ID}`);
  }
};

export default plugin;
