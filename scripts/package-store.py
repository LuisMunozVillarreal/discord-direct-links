"""Validate and deterministically package existing upload materials (stdlib only)."""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def png_size(file):
    data = file.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"Not a PNG: {file.name}"
    return struct.unpack(">II", data[16:24])


def archive(file, entries):
    with zipfile.ZipFile(file, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo(name, (2020, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, data)
    with zipfile.ZipFile(file) as z:
        assert z.testzip() is None
        assert z.namelist() == sorted(entries)
        for name, data in entries.items():
            assert z.read(name) == data


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "dist/store")
    output = parser.parse_args().output.resolve()
    manifest = json.loads((ROOT / "extension/manifest.json").read_text())
    pkg = json.loads((ROOT / "package.json").read_text())
    lock = json.loads((ROOT / "package-lock.json").read_text())
    version = manifest["version"]
    assert version == pkg["version"] == lock["version"] == lock["packages"][""]["version"]
    assert len(manifest["description"]) <= 132
    expected = {"content.js", "manifest.json"} | {f"icons/icon-{s}.png" for s in (16, 32, 48, 128)}
    actual = {p.relative_to(ROOT / "extension").as_posix() for p in (ROOT / "extension").rglob("*") if p.is_file()}
    assert actual == expected, f"Unexpected runtime files: {actual ^ expected}"
    assert manifest["icons"] == {str(s): f"icons/icon-{s}.png" for s in (16, 32, 48, 128)}
    for size in (16, 32, 48, 128):
        assert png_size(ROOT / f"extension/icons/icon-{size}.png") == (size, size)
    assets = ROOT / "store/assets"
    for name, size in {"store-icon-128.png": (128, 128), "promo-small.png": (440, 280),
                       "promo-marquee.png": (1400, 560), "screenshot-01-baseline.png": (1280, 800),
                       "screenshot-02-enabled.png": (1280, 800)}.items():
        assert png_size(assets / name) == size, f"Wrong dimensions: {name}"
    assert (assets / "store-icon-128.png").read_bytes() == (ROOT / "extension/icons/icon-128.png").read_bytes()
    evidence = json.loads((assets / "capture-evidence.json").read_text())
    assert evidence["extensionVersion"] == version
    required_hashes = {f"extension/{name}" for name in expected} | {
        "store/demo.html", "scripts/capture-store.cjs",
        "store/assets/screenshot-01-baseline.png", "store/assets/screenshot-02-enabled.png"}
    assert set(evidence["sha256"]) == required_hashes
    for name, digest in evidence["sha256"].items():
        assert sha((ROOT / name).read_bytes()) == digest, f"Stale screenshot evidence: {name}; run npm run capture:store"
    baseline, enabled = evidence["results"]
    assert baseline["enabled"] is False and baseline["confirmationVisible"] is True
    assert baseline["destinationOpened"] is False
    assert enabled["enabled"] is True and enabled["destinationOpened"] is True
    assert enabled["confirmationVisible"] is False
    assert enabled["downloadHandlerVerified"] is True and enabled["openerIsolatedVerified"] is True
    output.mkdir(parents=True, exist_ok=True)
    extension_zip = output / f"discord-direct-links-{version}.zip"
    archive(extension_zip, {name: (ROOT / "extension" / name).read_bytes() for name in expected})
    entries = {extension_zip.name: extension_zip.read_bytes(), "PRIVACY.md": (ROOT / "PRIVACY.md").read_bytes(),
               "LICENSE": (ROOT / "LICENSE").read_bytes()}
    for name in ("UPLOAD-CHECKLIST.md", "listing.md", "privacy-declarations.md", "requirements.md", "ASSETS.md"):
        entries[name] = (ROOT / "store" / name).read_bytes()
    for name in ("store-icon-128.png", "promo-small.png", "promo-marquee.png",
                 "screenshot-01-baseline.png", "screenshot-02-enabled.png", "capture-evidence.json"):
        entries[f"assets/{name}"] = (assets / name).read_bytes()
    entries["SHA256SUMS.txt"] = "".join(f"{sha(data)}  {name}\n" for name, data in sorted(entries.items())).encode()
    (output / "SHA256SUMS.txt").write_bytes(entries["SHA256SUMS.txt"])
    bundle = output / f"discord-direct-links-upload-materials-{version}.zip"
    archive(bundle, entries)
    print(json.dumps({"version": version, "runtimeFiles": sorted(expected), "bundleFiles": len(entries),
                      "extensionZip": str(extension_zip), "extensionSha256": sha(extension_zip.read_bytes()),
                      "materialsZip": str(bundle), "materialsSha256": sha(bundle.read_bytes())}, indent=2))


if __name__ == "__main__":
    main()
