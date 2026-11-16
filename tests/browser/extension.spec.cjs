const { test, expect, chromium } = require("@playwright/test");
const path = require("node:path");

// These are fixtures, not Discord's current DOM or a signed-in Discord session.
const fixture = `<!doctype html><html><body>
<a id="external" href="https://example.com/guide" target="_blank"><span>External guide</span></a>
<a id="internal" href="/channels/1/2">Internal channel</a>
<a id="download" href="https://example.com/opaque" download>Download attachment</a>
<a id="cdn" href="https://cdn.discordapp.com/attachments/1/2/file.exe">CDN attachment</a>
<a id="file" href="https://example.com/file.zip">File link</a>
<div role="dialog"><a id="dialogLink" href="https://example.com/opaque">Dialog confirmation</a></div>
<div id="notice" hidden>Fixture confirmation</div>
<script>
window.handled = [];
document.addEventListener('click', event => {
  const anchor = event.target.closest('a');
  if (!anchor) return;
  event.preventDefault();
  window.handled.push(anchor.id);
  document.querySelector('#notice').hidden = false;
});
</script></body></html>`;

async function browserFixture(extension = true) {
  const extensionPath = path.resolve("dist/discord-direct-links");
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium", headless: true,
    args: extension ? [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ] : []
  });
  // Never make requests to the real sites, including popups.
  await context.route("**/*", route => route.fulfill({
    status: 200, contentType: "text/html",
    body: new URL(route.request().url()).hostname === "example.com"
      && route.request().url().endsWith("/guide")
      ? "<!doctype html><title>Fixture destination</title><p>Destination</p>" : fixture
  }));
  const page = await context.newPage();
  return { context, page };
}

for (const host of ["discord.com", "ptb.discord.com", "canary.discord.com"]) {
  test(`installed extension opens a real trusted click on fixture ${host}`, async () => {
    const { context, page } = await browserFixture();
    try {
      await page.goto(`https://${host}/channels/@me`);
      const popupPromise = context.waitForEvent("page");
      await page.locator("#external span").click();
      const popup = await popupPromise;
      await popup.waitForLoadState();
      expect(popup.url()).toBe("https://example.com/guide");
      expect(await popup.evaluate(() => window.opener === null)).toBe(true);
      expect(await page.evaluate(() => window.handled)).toEqual([]);
      await expect(page.locator("#notice")).toBeHidden();
    } finally { await context.close(); }
  });
}

test("same fixture without extension shows the confirmation", async () => {
  const { context, page } = await browserFixture(false);
  try {
    await page.goto("https://discord.com/channels/@me");
    await page.locator("#external").click();
    await expect(page.locator("#notice")).toBeVisible();
    expect(await page.evaluate(() => window.handled)).toEqual(["external"]);
  } finally { await context.close(); }
});

for (const method of ["keyboard", "ctrl", "middle", "dynamic"]) {
  test(`native ${method} activation still opens the destination`, async () => {
    const { context, page } = await browserFixture();
    try {
      await page.goto("https://discord.com/channels/@me");
      if (method === "dynamic") {
        await page.evaluate(() => {
          history.pushState({}, "", "/channels/3/4");
          document.querySelector("#external").remove();
          const anchor = document.createElement("a");
          anchor.id = "external";
          anchor.href = "https://example.com/guide";
          anchor.target = "_blank";
          anchor.textContent = "Added later";
          document.body.append(anchor);
        });
      }
      const popupPromise = context.waitForEvent("page");
      if (method === "keyboard") {
        await page.locator("#external").focus();
        await page.keyboard.press("Enter");
      } else {
        await page.locator("#external").click({
          modifiers: method === "ctrl" ? ["Control"] : [],
          button: method === "middle" ? "middle" : "left"
        });
      }
      const popup = await popupPromise;
      await popup.waitForLoadState();
      expect(popup.url()).toBe("https://example.com/guide");
      await expect(page.locator("#notice")).toBeHidden();
    } finally { await context.close(); }
  });
}

test("download, attachment, internal and existing dialog handlers remain reachable", async () => {
  const { context, page } = await browserFixture();
  try {
    await page.goto("https://discord.com/channels/@me");
    for (const id of ["download", "cdn", "file", "internal", "dialogLink"]) {
      await page.locator(`#${id}`).click();
      await expect(page.locator("#notice")).toBeVisible();
      await page.locator("#notice").evaluate(el => { el.hidden = true; });
    }
    expect(await page.evaluate(() => window.handled)).toEqual(["download", "cdn", "file", "internal", "dialogLink"]);
  } finally { await context.close(); }
});

test("content script does not operate on unrelated sites", async () => {
  const { context, page } = await browserFixture();
  try {
    await page.goto("https://example.org/");
    await page.locator("#external").click();
    await expect(page.locator("#notice")).toBeVisible();
    expect(await page.evaluate(() => window.handled)).toEqual(["external"]);
  } finally { await context.close(); }
});
