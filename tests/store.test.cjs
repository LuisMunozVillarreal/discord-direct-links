const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

test("store icons are declared and have their exact PNG dimensions", () => {
  const manifest = JSON.parse(fs.readFileSync("extension/manifest.json"));
  const expected = Object.fromEntries([16, 32, 48, 128].map(size => [size, `icons/icon-${size}.png`]));
  assert.deepEqual(manifest.icons, expected);
  for (const [size, file] of Object.entries(expected)) {
    const png = fs.readFileSync(`extension/${file}`);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), Number(size));
    assert.equal(png.readUInt32BE(20), Number(size));
  }
  assert.ok(manifest.description.length <= 132);
});

test("upload package validates assets and contains exactly the runtime files", () => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "discord-store-test-"));
  try {
    const result = spawnSync("python3", ["scripts/package-store.py", "--output", output], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const version = JSON.parse(fs.readFileSync("package.json")).version;
    const check = spawnSync("python3", ["-c", `
import hashlib, json, pathlib, sys, zipfile
out, version = pathlib.Path(sys.argv[1]), sys.argv[2]
with zipfile.ZipFile(out / f'discord-direct-links-{version}.zip') as z:
    assert z.testzip() is None
    expected = ['content.js', 'manifest.json'] + [f'icons/icon-{s}.png' for s in (16,32,48,128)]
    assert sorted(z.namelist()) == sorted(expected)
    for name in expected:
        assert z.read(name) == pathlib.Path('extension', name).read_bytes()
    assert json.loads(z.read('manifest.json'))['version'] == version
with zipfile.ZipFile(out / f'discord-direct-links-upload-materials-{version}.zip') as z:
    assert z.testzip() is None
    for name in ['UPLOAD-CHECKLIST.md', 'PRIVACY.md', 'listing.md', 'privacy-declarations.md', 'requirements.md', 'ASSETS.md', 'SHA256SUMS.txt', f'discord-direct-links-{version}.zip']:
        assert name in z.namelist(), name
    for line in z.read('SHA256SUMS.txt').decode().splitlines():
        digest, name = line.split('  ', 1)
        assert hashlib.sha256(z.read(name)).hexdigest() == digest
print('ZIP entries, runtime bytes, bundle documents, and checksums verified')
`, output, version], { encoding: "utf8" });
    assert.equal(check.status, 0, check.stdout + check.stderr);
  } finally { fs.rmSync(output, { recursive: true, force: true }); }
});
