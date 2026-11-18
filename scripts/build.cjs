const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const output = path.join(root, "dist", "discord-direct-links");
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of ["manifest.json", "content.js", ...[16, 32, 48, 128].map(size => `icons/icon-${size}.png`)]) {
  fs.mkdirSync(path.dirname(path.join(output, file)), { recursive: true });
  fs.copyFileSync(path.join(root, "extension", file), path.join(output, file));
}
console.log("Built dist/discord-direct-links (manifest, content script, four icons).");
