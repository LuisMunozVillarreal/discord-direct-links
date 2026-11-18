// Capture real browser renders only after observing trusted-click results.
// This is an offline fixture demonstration, never a signed-in Discord session.
const { chromium, expect } = require("@playwright/test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const runtime = path.join(root, "dist/discord-direct-links");
const assets = path.join(root, "store/assets");
const manifest = JSON.parse(fs.readFileSync(path.join(runtime, "manifest.json")));
const hashes = {};
const hash = file => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex");
for (const file of ["manifest.json", "content.js", ...Object.values(manifest.icons)]) {
  hashes[`extension/${file}`] = hash(`extension/${file}`);
  assert.deepEqual(fs.readFileSync(path.join(runtime, file)), fs.readFileSync(path.join(root, "extension", file)));
}

(async () => {
  const results = [];
  let browserVersion;
  for (const enabled of [false, true]) {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium", headless: true, viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1, serviceWorkers: "block",
      args: enabled ? [`--disable-extensions-except=${runtime}`, `--load-extension=${runtime}`] : []
    });
    try {
      browserVersion = context.browser().version();
      await context.route("**/*", async route => {
        const url = route.request().url();
        if (url === "https://discord.com/channels/@me") {
          return route.fulfill({ contentType: "text/html", body: fs.readFileSync(path.join(root, "store/demo.html"), "utf8") });
        }
        if (url === "https://example.com/guide") {
          return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Local destination</title><h1>Harmless local demo destination</h1>" });
        }
        return route.abort(); // Fail closed: no real site requests or downloads.
      });
      const page = await context.newPage();
      if (enabled) {
        await page.goto("chrome://extensions");
        await page.locator("extensions-item").waitFor();
        const installed = await page.locator("extensions-item").evaluateAll(items => items.map(item => ({
          name: item.data.name, version: item.data.version, state: item.data.state,
          errors: item.data.runtimeErrors, manifestErrors: item.data.manifestErrors
        })));
        assert.deepEqual(installed, [{ name: manifest.name, version: manifest.version, state: "ENABLED", errors: [], manifestErrors: [] }]);
        console.log("Chrome extension card verified:", JSON.stringify(installed));
      }
      await page.goto("https://discord.com/channels/@me");
      if (enabled) {
        const popupPromise = context.waitForEvent("page");
        await page.locator("#external").click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        assert.equal(popup.url(), "https://example.com/guide");
        assert.equal(await popup.evaluate(() => window.opener === null), true);
        await expect(page.locator("#notice")).toBeHidden();
        assert.deepEqual(await page.evaluate(() => window.handled), []);
        await popup.close();
        await page.locator("#download").click();
        assert.deepEqual(await page.evaluate(() => window.handled), ["download"]);
        await page.evaluate(() => {
          document.querySelector("#heading").textContent = "Extension enabled: opens directly";
          document.querySelector("#result").textContent = "Destination opened in a new tab.";
          document.querySelector("#detail").textContent = "Browser verified: no demo confirmation, no opener access. The sample download control still reached the original handler. This is test instrumentation, not extension UI.";
        });
      } else {
        await page.locator("#external").click();
        await expect(page.locator("#notice")).toBeVisible();
        assert.deepEqual(await page.evaluate(() => window.handled), ["external"]);
        assert.equal(context.pages().filter(p => p.url() === "https://example.com/guide").length, 0);
        await page.evaluate(() => {
          document.querySelector("#heading").textContent = "Without the extension: a confirmation";
          document.querySelector("#result").textContent = "The page's click handler ran.";
          document.querySelector("#detail").textContent = "The demo stopped navigation and displayed its confirmation. This is a fixture, not Discord's actual dialog.";
        });
      }
      const file = enabled ? "screenshot-02-enabled.png" : "screenshot-01-baseline.png";
      await page.screenshot({ path: path.join(assets, file), fullPage: false, animations: "disabled" });
      hashes[`store/assets/${file}`] = hash(`store/assets/${file}`);
      results.push({ enabled, screenshot: file, destinationOpened: enabled, confirmationVisible: !enabled,
        downloadHandlerVerified: enabled, openerIsolatedVerified: enabled });
    } finally { await context.close(); }
  }
  for (const file of ["store/demo.html", "scripts/capture-store.cjs"]) hashes[file] = hash(file);
  fs.writeFileSync(path.join(assets, "capture-evidence.json"), JSON.stringify({
    extensionVersion: manifest.version, browserVersion, viewport: { width: 1280, height: 800 },
    provenance: "Installed-extension test fixture; all network requests intercepted; synthetic content; not live Discord. Status text is added by the test runner only after assertions pass.",
    results, sha256: hashes
  }, null, 2) + "\n");
  console.log(JSON.stringify({ extensionVersion: manifest.version, browserVersion, results }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
