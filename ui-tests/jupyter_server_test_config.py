"""Server configuration for integration tests.

!! Never use this configuration in production because it
opens the server to the world and provide access to JupyterLab
JavaScript objects through the global window variable.
"""
import os

from jupyterlab.galata import configure_jupyter_server

configure_jupyter_server(c)

# Only override when asked, so the server keeps galata's own default;
# playwright.config.js mirrors that default for the baseURL, which it cannot read
# from here. Truthiness, not a presence check: an exported-but-empty value would
# otherwise raise ValueError here while Playwright waited on 8888.
port = os.environ.get("JUPYTER_TEST_PORT")
if port:
    c.ServerApp.port = int(port)

# Uncomment to set server log level to debug level
# c.ServerApp.log_level = "DEBUG"
