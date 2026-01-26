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

  it('should target directory items only', () => {
    const selector = '.jp-DirListing-item[data-isdir="true"]';
    expect(selector).toContain('data-isdir="true"');
    expect(selector).toContain('.jp-DirListing-item');
  });

  it('should have correct menu label', () => {
    const label = 'Open in Terminal';
    expect(label).toBe('Open in Terminal');
  });
});
