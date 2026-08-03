/**
 * Configuration for Playwright using default from @jupyterlab/galata
 *
 * The port is threaded through both ends: galata's `configure_jupyter_server`
 * pins 8888 with no retries, so a developer already running JupyterLab there
 * cannot start the suite. Set JUPYTER_TEST_PORT to move both the server and
 * the baseURL. `reuseExistingServer` stays false so the suite never opens
 * terminals in a lab it did not start.
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

const PORT = process.env.JUPYTER_TEST_PORT || '8888';
const BASE_URL = `http://localhost:${PORT}`;

module.exports = {
  ...baseConfig,
  use: { ...baseConfig.use, baseURL: BASE_URL },
  webServer: {
    command: 'jlpm start',
    url: `${BASE_URL}/lab`,
    timeout: 120 * 1000,
    reuseExistingServer: false
  }
};
