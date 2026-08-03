/**
 * Unit tests for jupyterlab_open_in_terminal_extension.
 *
 * The real `@jupyterlab/filebrowser` -> `apputils` -> `ui-components` chain
 * pulls in untranspiled ESM that Jest cannot load, so the plugin's four value
 * imports are mocked. `@jupyterlab/application` needs no mock only because it
 * is type-only and TypeScript elides it - importing a value from it would pull
 * the same ESM chain back in and break this suite.
 *
 * The plugin module itself stays real: these tests exercise the registered
 * command and fail when its behaviour drifts.
 */
jest.mock('@jupyterlab/filebrowser', () => ({
  IDefaultFileBrowser: 'IDefaultFileBrowser'
}));
jest.mock('@jupyterlab/translation', () => ({ ITranslator: 'ITranslator' }));
jest.mock('@jupyterlab/apputils', () => ({ showErrorMessage: jest.fn() }));
jest.mock('@jupyterlab/ui-components', () => ({
  terminalIcon: { bindprops: jest.fn(() => 'terminalIcon') }
}));

import plugin from '../index';

type Registered = {
  label: string;
  isVisible: () => boolean;
  execute: () => Promise<void>;
};

/** Build a `.jp-DirListing-item` node the hit test will match. */
function itemNode(isdir: boolean): HTMLElement {
  const node = document.createElement('li');
  node.classList.add('jp-DirListing-item');
  node.dataset.isdir = isdir ? 'true' : 'false';
  return node;
}

/**
 * Activate the plugin against fakes and return what it registered.
 *
 * `hit` is the node `contextMenuHitTest` resolves to - null models a
 * right-click on the empty file browser area.
 */
function activate(options: { hit: HTMLElement | null; path?: string }) {
  const execute = jest.fn().mockResolvedValue(undefined);
  const addCommand = jest.fn();
  const addItem = jest.fn();

  const app = {
    commands: { addCommand, execute },
    contextMenu: { addItem },
    serviceManager: { terminals: { isAvailable: () => true } },
    contextMenuHitTest: (fn: (node: HTMLElement) => boolean) =>
      options.hit && fn(options.hit) ? options.hit : undefined
  };
  const fileBrowser = { model: { path: options.path ?? 'work' } };
  const translator = { load: () => ({ __: (s: string) => s }) };

  (plugin.activate as any)(app, fileBrowser, translator);

  return {
    execute,
    addItem,
    command: addCommand.mock.calls[0] as [string, Registered]
  };
}

describe('plugin metadata', () => {
  it('declares the expected id and dependencies', () => {
    expect(plugin.id).toBe('jupyterlab_open_in_terminal_extension:plugin');
    expect(plugin.autoStart).toBe(true);
    expect(plugin.requires).toEqual(['IDefaultFileBrowser', 'ITranslator']);
  });
});

describe('registration', () => {
  it('registers the command under the core label', () => {
    const [id, command] = activate({ hit: null }).command;

    expect(id).toBe('filebrowser:open-in-terminal');
    expect(command.label).toBe('Open in Terminal');
  });

  it('places the item on the listing content at rank 3', () => {
    expect(activate({ hit: null }).addItem).toHaveBeenCalledWith({
      command: 'filebrowser:open-in-terminal',
      selector: '.jp-DirListing-content',
      rank: 3
    });
  });

  it('registers nothing when terminals are unavailable', () => {
    const addCommand = jest.fn();
    const addItem = jest.fn();
    const app = {
      commands: { addCommand, execute: jest.fn() },
      contextMenu: { addItem },
      serviceManager: { terminals: { isAvailable: () => false } },
      contextMenuHitTest: () => undefined
    };

    (plugin.activate as any)(
      app,
      { model: { path: '' } },
      {
        load: () => ({ __: (s: string) => s })
      }
    );

    expect(addCommand).not.toHaveBeenCalled();
    expect(addItem).not.toHaveBeenCalled();
  });
});

describe('visibility', () => {
  it('is visible on the empty file browser area', () => {
    expect(activate({ hit: null }).command[1].isVisible()).toBe(true);
  });

  it('is visible on a file, which core does not cover', () => {
    expect(activate({ hit: itemNode(false) }).command[1].isVisible()).toBe(
      true
    );
  });

  it('is hidden on a folder, which core already covers', () => {
    expect(activate({ hit: itemNode(true) }).command[1].isVisible()).toBe(
      false
    );
  });
});

describe('execute', () => {
  it('opens a terminal in the current folder from the empty area', async () => {
    const { command, execute } = activate({ hit: null, path: 'work/notes' });

    await command[1].execute();

    expect(execute).toHaveBeenCalledWith('terminal:create-new', {
      cwd: 'work/notes'
    });
  });

  it('opens a terminal in the current folder from a file', async () => {
    const { command, execute } = activate({
      hit: itemNode(false),
      path: 'work/notes'
    });

    await command[1].execute();

    expect(execute).toHaveBeenCalledWith('terminal:create-new', {
      cwd: 'work/notes'
    });
  });

  it('reports a failed terminal creation instead of throwing', async () => {
    const { showErrorMessage } = jest.requireMock('@jupyterlab/apputils');
    const { command, execute } = activate({ hit: null });
    execute.mockRejectedValue(new Error('no terminals'));

    await expect(command[1].execute()).resolves.toBeUndefined();
    expect(showErrorMessage).toHaveBeenCalledWith(
      'Failed to open new terminal',
      expect.any(Error)
    );
  });
});
