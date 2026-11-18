# Privacy practices and permission declarations

Prepared from `extension/manifest.json` and the complete `extension/content.js` for version 0.1.1. These are copy-ready technical declarations, not an attestation made on the account owner's behalf. Review the actual dashboard wording before certifying.

## Single purpose

Open eligible ordinary HTTP and HTTPS links from Discord web without Discord's external-link confirmation, while preserving native browser navigation and leaving recognized download, attachment and existing-dialog controls to Discord.

## Site-access justification

The isolated content script must run on https://discord.com/*, https://ptb.discord.com/* and https://canary.discord.com/* to intercept user-initiated link clicks before Discord's handlers. It examines the clicked link URL and nearby element attributes locally to exclude Discord links, attachments, downloads and dialogs, then lets the browser follow eligible links. All paths are matched because Discord is a single-page application and links can appear across its routes. No unrelated website access is requested.

These are `content_scripts.matches`, not a separate `host_permissions` entry. If the dashboard groups them as host permissions, use the justification above. There are no `permissions`, `optional_permissions`, `host_permissions` or `optional_host_permissions` keys. Do not add permissions just to match a dashboard example. There is no tabs, history, cookies, storage, downloads, webRequest or scripting API access.

## Remote code

Select **No, I am not using remote code.**

All executable extension code is the packaged `content.js`. There are no remote scripts, dynamic imports, eval, remote configuration, network libraries or runtime dependencies. Navigating to a user-clicked website is not loading remote extension code.

## Data usage

Disclose local handling rather than claiming that the extension never accesses data. Google's current User Data FAQ explicitly says local-only processing must be disclosed.

For the standard data-type checkboxes, select these categories for the narrow local handling described below:

| Category | Why it applies | Retention / transmission by the extension |
| --- | --- | --- |
| Web history | The URL of a link the user interacts with, not Chrome's history database or a browsing log. | Transient only; none stored or sent to the developer. |
| User activity | The click event needed to decide whether to handle a link, not activity tracking or recording. | Transient only; none stored or sent to the developer. |
| Website content | Hyperlink URLs and relevant element attributes, including download labels and ancestor indicators. | Transient only; none stored or sent to the developer. |

Do not select personally identifiable information, health information, financial and payment information, authentication information, personal communications or location as separately collected categories. The script does not extract those data types or message bodies. Link URLs and attributes can nonetheless contain personal information; disclose that incidental handling in the privacy policy rather than promise it is impossible. It does not geolocate users or access credentials, cookies or account tokens from storage. It checks for username/password components in a clicked URL solely to exclude credential-bearing links from bypass handling; these values are not saved, used for authentication or sent to the developer.

If the dashboard introduces an explicit distinction between local handling and off-device collection, retain the local-processing disclosure and answer the off-device question **No**. Never equate "no server" with "no access to user data". Normal browser requests to a destination the user opens are explained separately in the policy.

## Limited-use certifications

The current implementation supports all three standard certifications. The publisher must read and personally confirm the dashboard text:

- User data is not sold or transferred to third parties outside approved use cases.
- User data is not used or transferred for purposes unrelated to the extension's single purpose.
- User data is not used or transferred to determine creditworthiness or for lending purposes.

There is no developer-operated data endpoint, analytics service, monetization, or stored user data. The policy contains the Limited Use statement. Do not advertise "no data handling" or "no permissions"; both would hide the actual local processing and site access.

## Policy URL and reviewer notes

Use a publicly readable URL to `PRIVACY.md`, not a local path. See the upload checklist for the branch URL and the post-merge URL.

Reviewer note, if a test-instructions field is available:

> No extension-specific account or credentials are required. The extension works on Discord web; use your own Discord account and harmless content for live review. Do not provide or request another person's login. Install the extension and reload Discord. Compare a trusted external link with the extension disabled and enabled, reloading each time and leaving any domain-trust option unchecked. Recognized download and existing-dialog controls are intentionally excluded. Public source includes a reproducible offline fixture demo and browser integration tests, which do not contact Discord. The demo status UI is test instrumentation, not a shipped popup or settings page.
