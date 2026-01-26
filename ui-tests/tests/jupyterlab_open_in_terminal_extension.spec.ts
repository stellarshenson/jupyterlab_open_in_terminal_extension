import { expect, test } from '@jupyterlab/galata';

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false });

test('should emit an activation console message', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });

  await page.goto();

  expect(
    logs.filter(
      s =>
        s ===
        'JupyterLab extension jupyterlab_open_in_terminal_extension is activated!'
    )
  ).toHaveLength(1);
});

test('should register the command', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });

  await page.goto();

  expect(
    logs.filter(s => s === 'Command registered: filebrowser:open-in-terminal')
  ).toHaveLength(1);
});

test('should show context menu on folder right-click', async ({ page }) => {
  await page.goto();

  // Wait for file browser to be visible
  await page.waitForSelector('.jp-FileBrowser');

  // Create a test folder
  await page.click('button[title="New Folder"]');
  await page.waitForTimeout(500);

  // Find the new folder in the file browser
  const folder = page.locator('.jp-DirListing-item[data-isdir="true"]').first();
  await expect(folder).toBeVisible();

  // Right-click to open context menu
  await folder.click({ button: 'right' });

  // Check that "Open in Terminal" menu item exists
  const menuItem = page.locator('.lm-Menu-itemLabel:text("Open in Terminal")');
  await expect(menuItem).toBeVisible();
});
