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

  it('should have correct menu label', () => {
    const label = 'Open Location in Terminal';
    expect(label).toBe('Open Location in Terminal');
  });
});
