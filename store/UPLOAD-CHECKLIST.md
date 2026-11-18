# Upload checklist for version 0.1.1

This packet prepares an upload. Nothing has been submitted or published to Chrome Web Store. Store approval is not guaranteed.

1. Extract `discord-direct-links-upload-materials-0.1.1.zip`. **Upload only `discord-direct-links-0.1.1.zip` as the extension package**, not the outer materials ZIP. The inner ZIP has `manifest.json` at its root and contains only six runtime files.
2. Check `SHA256SUMS.txt` against the extracted files. The tested runtime is unchanged except for manifest version and original icon assets. The source PR depends on implementation PR #1. Neither PR has been merged by the preparation agent. Resolve that source dependency before treating the main branch as the release source.
3. The owner must sign into their own Chrome Web Store developer account, finish any required registration, verification, fee and publisher/trader/contact details, and enable account security required by Google. This packet contains no invented account details. No registration or payment was performed.
4. Before submission, test the packaged build on current Discord with harmless content using the README live acceptance checklist. The included browser tests and screenshots are offline fixture evidence, not a new live Discord acceptance test. Do not upload private chats or account screenshots.
5. Create or open the intended dashboard item and upload the inner extension ZIP. Confirm name and version **Discord Direct Links 0.1.1**. If this item already has version 0.1.1 or higher, stop and prepare a properly versioned new build rather than reusing this package.
6. Copy the title, short description and detailed description from `listing.md`. Choose English and an appropriate productivity category. Review the safety warning and download limitations. Homepage and support URLs are supplied; verified-publisher status is not claimed.
7. Upload `assets/store-icon-128.png` as the store icon. Upload `assets/screenshot-02-enabled.png` first, then `assets/screenshot-01-baseline.png`. These are real captures of a labeled local fixture demonstration, not live Discord. Keep that disclosure in the listing. Both are 1280 x 800. The status panel is test instrumentation, not shipped UI.
8. Optionally upload `assets/promo-small.png` at 440 x 280 and `assets/promo-marquee.png` at 1400 x 560. These are illustrative original promotional graphics, **not screenshots**. Current official documentation does not require either tile. No Discord logo or endorsement is used.
9. Complete the Privacy practices tab using `privacy-declarations.md`. Declare the single purpose, three Discord site matches, no remote code, and local handling of link URLs, click events and element attributes. Read and confirm the limited-use certifications yourself. Do not claim zero site access or zero local data handling.
10. Provide a publicly accessible privacy-policy URL. While the preparation branch exists, use:

    https://github.com/LuisMunozVillarreal/discord-direct-links/blob/chore/store-upload-materials/PRIVACY.md

    After the owner merges the relevant changes, prefer the stable main-branch URL, **but open it while signed out and verify the policy is present before using it**:

    https://github.com/LuisMunozVillarreal/discord-direct-links/blob/main/PRIVACY.md

    The branch URL can stop working if the branch is deleted. No GitHub Pages site was created. If another public HTTPS host is preferred, publish the supplied `PRIVACY.md` there and verify it before entering its URL.

11. Choose visibility, regions and distribution deliberately. Review all account-specific fields and the full preview. Save a draft if not ready. **Submitting for review and publishing are separate owner actions, outside this preparation task.**

## Rebuild from source

Requires the Node version specified in README, npm, Python 3 and the installed Playwright Chromium build.

```sh
npm ci --ignore-scripts
npx playwright install chromium
npm run check
npm run package:store
```

The packages are created under `dist/store/`. The package checker rejects stale screenshot provenance, mismatched versions, unexpected runtime paths and incorrectly sized images. `npm run capture:store` rebuilds and recaptures the two screenshots with all network requests intercepted. Optional artwork regeneration requires Pillow and uses `python3 scripts/generate-store-art.py`; recapture screenshots after changing runtime icons or the manifest.

See `requirements.md` for official source links and `ASSETS.md` for image provenance.
