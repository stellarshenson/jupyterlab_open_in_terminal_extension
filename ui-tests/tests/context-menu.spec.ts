import { expect, test } from '@jupyterlab/galata';
import type { IJupyterLabPageFixture } from '@jupyterlab/galata';

/**
 * Integration coverage for docs/acc-crit-jupyterlab-open-in-terminal-extension.md.
 *
 * Core owns folders via `terminal:open-folder-in-terminal`; this extension owns
 * files and the empty file browser area via `filebrowser:open-in-terminal`.
 * Both render the same "Open in Terminal" label, so the assertions target the
 * command ids that lumino writes into `data-command`.
 */
const OUR_ITEM = '.lm-Menu-item[data-command="filebrowser:open-in-terminal"]';
const CORE_ITEM =
  '.lm-Menu-item[data-command="terminal:open-folder-in-terminal"]';
const LABEL = '.lm-Menu-item:visible .lm-Menu-itemLabel';

const DIR_NAME = 'acc-crit-folder';
const FILE_NAME = 'acc-crit-file.txt';
const NESTED_FILE = 'nested.txt';

/**
 * Number of visible menu items labelled exactly "Open in Terminal".
 *
 * Hidden items keep their nodes in the DOM with `lm-mod-hidden`, so a plain
 * count would not distinguish "hidden" from "absent".
 */
async function openInTerminalCount(
  page: IJupyterLabPageFixture
): Promise<number> {
  return page.locator(LABEL, { hasText: /^Open in Terminal$/ }).count();
}

async function openMenuOnItem(
  page: IJupyterLabPageFixture,
  name: string
): Promise<void> {
  await page
    .locator('.jp-DirListing-item', { hasText: name })
    .first()
    .click({ button: 'right' });
}

/**
 * Right-click the blank strip below the last listing entry.
 *
 * `DirListing` leaves the selection untouched here, which is exactly the case
 * the extension has to read from the event target rather than the selection.
 */
async function openMenuOnEmptyArea(
  page: IJupyterLabPageFixture
): Promise<void> {
  const content = page.locator('.jp-DirListing-content');
  const box = await content.boundingBox();
  if (!box) {
    throw new Error('file browser listing is not laid out');
  }
  const y = box.height - 8;

  // Fail loudly rather than quietly right-clicking an item: if the listing ever
  // grows past this point, these tests would still pass while covering nothing.
  const lastItem = page.locator('.jp-DirListing-item').last();
  const itemBox = await lastItem.boundingBox();
  if (itemBox && itemBox.y + itemBox.height > box.y + y) {
    throw new Error(
      `empty area click at y=${y} lands on a listing item - add fixtures below it or shrink the fixture set`
    );
  }

  await content.click({
    button: 'right',
    position: { x: box.width / 2, y }
  });
}

async function closeMenu(page: IJupyterLabPageFixture): Promise<void> {
  await page.keyboard.press('Escape');
  await expect(page.locator('.lm-Menu:visible')).toHaveCount(0);
}

/**
 * Record the arguments every `terminal:create-new` call receives, then call
 * through so the terminal is really created - a recorded cwd that never
 * reaches the server would prove nothing.
 */
async function recordTerminalCalls(
  page: IJupyterLabPageFixture
): Promise<void> {
  await page.evaluate(() => {
    const app = (window as any).jupyterapp;
    (window as any).__terminalCalls = [];
    const execute = app.commands.execute.bind(app.commands);
    app.commands.execute = (id: string, args: any) => {
      if (id === 'terminal:create-new') {
        (window as any).__terminalCalls.push(args);
      }
      return execute(id, args);
    };
  });
}

async function terminalCwds(page: IJupyterLabPageFixture): Promise<string[]> {
  return page.evaluate(() =>
    ((window as any).__terminalCalls as any[]).map(args => args?.cwd)
  );
}

test.describe('Open in Terminal context menu', () => {
  test.beforeEach(async ({ page, tmpPath }) => {
    await page.contents.createDirectory(`${tmpPath}/${DIR_NAME}`);
    await page.contents.uploadContent(
      'acc crit',
      'text',
      `${tmpPath}/${FILE_NAME}`
    );
    await page.contents.uploadContent(
      'acc crit',
      'text',
      `${tmpPath}/${DIR_NAME}/${NESTED_FILE}`
    );
    await page.filebrowser.refresh();
  });

  test('folder shows exactly one item, provided by core', async ({ page }) => {
    await openMenuOnItem(page, DIR_NAME);

    await expect(page.locator(CORE_ITEM)).toBeVisible();
    await expect(page.locator(OUR_ITEM)).toBeHidden();
    expect(await openInTerminalCount(page)).toBe(1);

    await closeMenu(page);
  });

  test('file shows exactly one item, provided by this extension', async ({
    page
  }) => {
    await openMenuOnItem(page, FILE_NAME);

    await expect(page.locator(OUR_ITEM)).toBeVisible();
    await expect(page.locator(CORE_ITEM)).toHaveCount(0);
    expect(await openInTerminalCount(page)).toBe(1);

    await closeMenu(page);
  });

  test('empty area shows the item when a folder is selected', async ({
    page
  }) => {
    // Selecting a folder is what broke this: the selection survives an empty
    // area right-click, so a selection-driven isVisible hid the item.
    await page.locator('.jp-DirListing-item', { hasText: DIR_NAME }).click();
    await openMenuOnEmptyArea(page);

    await expect(page.locator(OUR_ITEM)).toBeVisible();
    expect(await openInTerminalCount(page)).toBe(1);

    await closeMenu(page);
  });

  test('empty area shows the item when a file is selected', async ({
    page
  }) => {
    await page.locator('.jp-DirListing-item', { hasText: FILE_NAME }).click();
    await openMenuOnEmptyArea(page);

    await expect(page.locator(OUR_ITEM)).toBeVisible();
    expect(await openInTerminalCount(page)).toBe(1);

    await closeMenu(page);
  });

  test('empty area opens a terminal in the current folder', async ({
    page,
    tmpPath
  }) => {
    await recordTerminalCalls(page);
    await page.locator('.jp-DirListing-item', { hasText: DIR_NAME }).click();
    await openMenuOnEmptyArea(page);
    await page.locator(OUR_ITEM).click();

    await expect.poll(() => terminalCwds(page)).toEqual([tmpPath]);
  });

  test('file opens a terminal in its parent folder', async ({
    page,
    tmpPath
  }) => {
    await recordTerminalCalls(page);
    await page.filebrowser.openDirectory(`${tmpPath}/${DIR_NAME}`);
    await openMenuOnItem(page, NESTED_FILE);
    await page.locator(OUR_ITEM).click();

    await expect
      .poll(() => terminalCwds(page))
      .toEqual([`${tmpPath}/${DIR_NAME}`]);
  });
});
