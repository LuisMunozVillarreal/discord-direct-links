# Discord Direct Links

A small Chrome extension that opens ordinary external links from Discord web without Discord's confirmation step.

## Safety and scope

**This removes a phishing safeguard.** A link's visible text can hide its real destination. Check the destination before opening it and use this extension only if you accept that risk.

- Runs only on `https://discord.com/`, `https://ptb.discord.com/` and `https://canary.discord.com/`.
- Uses one isolated content script. No background service, account token, network requests, telemetry, stored data or extension API permissions.
- Stops Discord's click handlers for eligible HTTP(S) anchors and leaves Chrome's native navigation intact. The link's target and modifier keys retain their normal meaning. Adds `noopener` to handled links.
- Does not click confirmation buttons, change Discord settings, or bypass Chrome Safe Browsing or browser download warnings.
- Leaves Discord links, attachment and media hosts, download controls, disabled controls, and existing dialogs alone. It does not modify right-click menus or synthetic clicks.

Download detection is deliberately conservative. Links with a `download` attribute, attachment/download paths or query keys, attachment/media UI ancestors, and file-looking suffixes retain Discord's handling. Only `html`, `htm`, `php`, `asp`, and `aspx` suffixes are treated as web pages. Some ordinary links will therefore still show a confirmation.

An opaque URL can return a file or redirect somewhere else; the extension does not inspect responses. Chrome still handles those responses and its own warnings. Discord can change its DOM or event handling, so the live acceptance checklist below matters. This is not a Discord desktop-client modification and is not affiliated with Discord.

## Install unpacked in Chrome

1. Keep this folder in a stable location. Installing from a temporary folder will break when that folder is removed.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Select **Load unpacked**, then select the `extension` directory containing `manifest.json`.
4. Confirm **Discord Direct Links**, version **0.1.0**, is enabled with no reported errors.
5. Reload each open Discord tab. Loading or reloading an extension does not inject it into pages that were already open.

No build or Node installation is required for unpacked use. Alternatively, install the identical `dist/discord-direct-links` directory produced by the build command.

To update, replace the files, select **Reload** on the extension's card, verify its version, then reload Discord. To disable or uninstall, use the toggle or **Remove** on that card and reload Discord so any existing content script is removed.

## Verify locally

Requires Node.js 22.19 or newer and npm. The extension itself has no runtime dependencies.

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run check
npm audit --audit-level=low
```

On Linux CI, `npx playwright install --with-deps chromium` installs the browser's operating-system dependencies too.

`npm run check` runs the Node behavior/manifest/artifact tests, builds the two-file unpacked artifact, then runs Playwright with the actual extension installed in disposable Chromium profiles. Browser tests intercept every request and serve fixtures: they do **not** connect to real Discord or use an existing signed-in profile. They cover a no-extension baseline, all three supported origins, mouse and keyboard navigation, modifier and middle clicks, dynamically added links, attachment/download/dialog exclusions, opener isolation, and the unrelated-site permission boundary.

The GitHub Actions `verify` job runs the same gate and uploads the unpacked build. A workflow file alone is not evidence of a successful hosted run.

## Live acceptance checklist

Use a trusted existing link and a harmless attachment in Discord. Do not post a test message just to run this checklist.

- With the extension disabled and the page reloaded, confirm an ordinary external link shows Discord's confirmation. Cancel it without marking its domain trusted.
- Enable the extension, reload Discord, and click the same link. Confirm the intended destination opens without that dialog and without a duplicate tab.
- Check Enter on a focused link, Ctrl-click, and middle-click.
- Check an internal channel link still navigates inside Discord.
- Check an attachment/download control still follows Discord's original handling. Do not download an unsafe file to test a warning.
- Disable the extension and reload Discord; the original confirmation should return.

Fixture tests do not substitute for this live check. Keep any real messages, account information and screenshots out of the public repository.

## Development

Runtime source is in `extension/`. `scripts/build.cjs` copies only `manifest.json` and `content.js` into `dist/discord-direct-links`; it does not bundle development dependencies. Version tests keep the manifest, package, lockfile and changelog synchronized. Tests live in `tests/`.

Licensed under MIT. See [LICENSE](LICENSE).
