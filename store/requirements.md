# Official requirements checked on 2026-11-18

Current Chrome documentation was fetched directly from the URLs below. Dashboard wording and review decisions can change; recheck before submission.

| Item | Current documented requirement | Supplied |
| --- | --- | --- |
| Extension ZIP | Manifest at ZIP root; complete runtime; increasing version; description at most 132 characters. | Version 0.1.1, six allowlisted runtime files. |
| Store icon | Required, 128 x 128 PNG; square artwork about 96 x 96 with transparent padding. | Original outbound-link icon; also 16, 32 and 48px runtime variants. |
| Screenshots | At least one, maximum five; full bleed, square corners; 1280 x 800 preferred, or 640 x 400. | Two actual 1280 x 800 PNG browser captures of an installed-extension fixture demo. |
| Small promo tile | Optional, 440 x 280 PNG or JPEG. | Original illustrative art, not a screenshot. |
| Marquee | Optional, 1400 x 560 PNG or JPEG. | Original illustrative art, not a screenshot. |
| Privacy | Single purpose, minimum permission explanations, remote-code declaration, data-use certification and public policy URL. Local processing must be disclosed. | Copy in privacy-declarations.md and policy in PRIVACY.md. |

The current documentation says promotional tiles are **optional**, not mandatory. Both are included for convenience. No video is required or supplied. The screenshots are genuine renders of a controlled demo, not images of a private or live Discord session; store acceptance remains Google's decision.

Sources:

- https://developer.chrome.com/docs/webstore/prepare
- https://developer.chrome.com/docs/webstore/images
- https://developer.chrome.com/docs/webstore/cws-dashboard-listing
- https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
- https://developer.chrome.com/docs/webstore/program-policies/user-data-faq
- https://developer.chrome.com/docs/extensions/reference/manifest/icons
