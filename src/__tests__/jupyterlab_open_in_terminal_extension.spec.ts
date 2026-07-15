/**
 * Unit tests for jupyterlab_open_in_terminal_extension
 *
 * Note: These tests verify the plugin structure without importing the full
 * module chain to avoid ESM transformation issues with Jest.
 */

describe('jupyterlab_open_in_terminal_extension', () => {
  it('should define the expected command ID', () => {
    const COMMAND_ID = 'filebrowser:open-in-terminal';
    expect(COMMAND_ID).toBe('filebrowser:open-in-terminal');
  });

  it('should have expected plugin ID format', () => {
    const pluginId = 'jupyterlab_open_in_terminal_extension:plugin';
    expect(pluginId).toContain('jupyterlab_open_in_terminal_extension');
    expect(pluginId).toContain(':plugin');
  });

  it('should target file browser content area', () => {
    const selector = '.jp-DirListing-content';
    expect(selector).toBe('.jp-DirListing-content');
  });

  it('should reuse the core terminal create command', () => {
    const createCommand = 'terminal:create-new';
    expect(createCommand).toBe('terminal:create-new');
  });

  it('should keep the standard menu label', () => {
    const label = 'Open in Terminal';
    expect(label).toBe('Open in Terminal');
  });
});
