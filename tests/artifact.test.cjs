const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { spawnSync } = require("node:child_process");

test("version metadata and exact permission boundary stay synchronized", () => {
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.json"));
  const pkg = JSON.parse(fs.readFileSync("package.json"));
  const lock = JSON.parse(fs.readFileSync("package-lock.json"));
  assert.equal(manifest.version, pkg.version);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
  assert.equal(pkg.engines.node, lock.packages["node_modules/jsdom"].engines.node);
  assert.equal(lock.packages[""].engines.node, pkg.engines.node);
  assert.ok(fs.readFileSync("README.md", "utf8").includes(pkg.engines.node));
  assert.ok(fs.readFileSync("CHANGELOG.md", "utf8").includes(`## ${pkg.version}\n`));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(Object.keys(manifest).sort(), ["manifest_version", "name", "version", "description", "content_scripts", "icons"].sort());
  assert.deepEqual(manifest.content_scripts, [{
    matches: ["https://discord.com/*", "https://ptb.discord.com/*", "https://canary.discord.com/*"],
    js: ["content.js"], run_at: "document_start", world: "ISOLATED"
  }]);
});

test("build ships only the audited runtime and icons, byte for byte", () => {
  const result = spawnSync(process.execPath, ["scripts/build.cjs"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readdirSync("dist/discord-direct-links").sort(), ["content.js", "icons", "manifest.json"]);
  assert.deepEqual(fs.readdirSync("dist/discord-direct-links/icons").sort(), ["icon-128.png", "icon-16.png", "icon-32.png", "icon-48.png"]);
  for (const file of ["content.js", "manifest.json", ...[16, 32, 48, 128].map(size => `icons/icon-${size}.png`)]) {
    assert.deepEqual(fs.readFileSync(`dist/discord-direct-links/${file}`), fs.readFileSync(`extension/${file}`));
  }
  const source = fs.readFileSync("extension/content.js", "utf8");
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|eval)\b|chrome\.|document\.cookie/);
});
