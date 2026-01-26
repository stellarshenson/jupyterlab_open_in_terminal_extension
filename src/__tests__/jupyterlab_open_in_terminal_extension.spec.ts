/**
 * Unit tests for jupyterlab_open_in_terminal_extension
 */

import plugin from '../index';

describe('jupyterlab_open_in_terminal_extension', () => {
  it('should have correct plugin id', () => {
    expect(plugin.id).toBe('jupyterlab_open_in_terminal_extension:plugin');
  });

  it('should auto start', () => {
    expect(plugin.autoStart).toBe(true);
  });

  it('should require IDefaultFileBrowser', () => {
    expect(plugin.requires).toBeDefined();
    expect(plugin.requires!.length).toBeGreaterThanOrEqual(1);
  });

  it('should have an activate function', () => {
    expect(typeof plugin.activate).toBe('function');
  });

  it('should have a description', () => {
    expect(plugin.description).toContain('context menu');
    expect(plugin.description).toContain('terminal');
  });
});
