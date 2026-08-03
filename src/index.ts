import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IDefaultFileBrowser } from '@jupyterlab/filebrowser';
import { showErrorMessage } from '@jupyterlab/apputils';
import { ITranslator } from '@jupyterlab/translation';
import { terminalIcon } from '@jupyterlab/ui-components';

/**
 * The command ID for opening a terminal from a file or the empty browser area.
 *
 * JupyterLab core already provides `terminal:open-folder-in-terminal` for
 * folders (label "Open in Terminal"). This command complements it, reusing the
 * same label and the core `terminal:create-new` command, for the two cases core
 * does not cover: a selected file and the empty file browser area.
 */
const COMMAND_ID = 'filebrowser:open-in-terminal';

/**
 * The core terminal creation command, reused to open the terminal.
 */
const CREATE_TERMINAL_COMMAND = 'terminal:create-new';

/**
 * The file browser item class, used to tell an item click from an empty area
 * click.
 */
const ITEM_CLASS = 'jp-DirListing-item';

/**
 * Initialization data for the jupyterlab_open_in_terminal_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_open_in_terminal_extension:plugin',
  description:
    'Complements the built-in Open in Terminal command for files and the empty file browser area',
  autoStart: true,
  requires: [IDefaultFileBrowser, ITranslator],
  activate: (
    app: JupyterFrontEnd,
    fileBrowser: IDefaultFileBrowser,
    translator: ITranslator
  ) => {
    console.log(
      'JupyterLab extension jupyterlab_open_in_terminal_extension is activated!'
    );

    const { commands, serviceManager } = app;

    // Match core behaviour: do nothing if terminals are not available
    if (!serviceManager.terminals.isAvailable()) {
      return;
    }

    // Same catalogue as core, so both items render one translated label
    const trans = translator.load('jupyterlab');

    // `DirListing` leaves the selection untouched when the empty area is
    // right-clicked, so the selection cannot distinguish an empty area click
    // from an item click. Read the context menu event target instead.
    const hitItem = () =>
      app.contextMenuHitTest(node => node.classList.contains(ITEM_CLASS));

    commands.addCommand(COMMAND_ID, {
      label: trans.__('Open in Terminal'),
      caption: trans.__('Open a terminal at this location'),
      icon: terminalIcon.bindprops({ stylesheet: 'menuItem' }),
      isVisible: () => {
        const node = hitItem();
        // Empty area - core registers nothing here
        if (!node) {
          return true;
        }
        // Complement core only: hide on directories, which core already covers
        return node.dataset.isdir !== 'true';
      },
      execute: async () => {
        // A listing only ever renders children of its own path, so the current
        // folder is the target for a file and for the empty area alike.
        try {
          await commands.execute(CREATE_TERMINAL_COMMAND, {
            cwd: fileBrowser.model.path
          });
        } catch (error) {
          await showErrorMessage(
            trans.__('Failed to open new terminal'),
            error as Error
          );
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
