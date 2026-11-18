# Privacy policy for Discord Direct Links

Applies to version 0.1.1. Last updated: 2026-11-18.

## Purpose and local data handling

Discord Direct Links opens eligible external links from Discord web without Discord's confirmation step. It runs only on discord.com, ptb.discord.com and canary.discord.com.

When you activate a link, the extension reads the click event, the link's URL and attributes, and nearby page-element attributes. This includes link destinations, URL paths and query parameters, download labels, and indicators of attachments or dialogs. URLs and attributes can contain personal information. This processing happens only in your browser and only to decide whether to leave Discord's handling intact or allow native browser navigation without Discord's click handler. For an eligible link it also adds `noopener` to the link.

The extension does not read message bodies, your message history, form entries, Chrome's browsing-history database, or Discord account credentials and cookies from storage. It does parse any username or password embedded in a clicked URL solely to reject that link from bypass handling. Sensitive values can also occur in URL paths, queries or attributes; they remain subject to the local-only processing described above. It does not record click activity or maintain a list of visited URLs. It has no analytics, advertising, telemetry, background service, or extension account.

## Storage, transmission and sharing

The extension does not persist the data it processes, create logs, or send that data to the developer or a third party. Processing is transient during a click; the `noopener` change lasts in the current page's DOM. There is no extension-held user-data archive to access or delete.

Opening a link is still ordinary browser navigation. The destination website receives its normal browser request and may collect data under its own policy. This can include the requested URL, IP address, applicable cookies and a referrer subject to browser and page policy. The extension does not proxy navigation, inspect responses, or guarantee that a destination is private or safe. It supports HTTP as well as HTTPS links; it does not upgrade insecure destinations.

Discord, Chrome, the Chrome Web Store and GitHub operate independently and have their own privacy policies. If you choose to contact the project through a GitHub issue, the issue is public and GitHub processes what you submit. Do not post private messages, credentials or sensitive URLs there.

## Limited use

Discord Direct Links uses locally processed data only to provide its stated link-opening function, in accordance with the Chrome Web Store User Data Policy, including the Limited Use requirements. The extension does not sell or transfer user data to the developer or third parties, use it for advertising or credit decisions, or make it available for human inspection.

## Your control and contact

Disable or remove the extension at `chrome://extensions`, then reload Discord tabs to remove existing content scripts. There is no saved extension data to erase. Browser history and destination-site data remain subject to your browser's and those sites' controls.

Questions or bug reports: https://github.com/LuisMunozVillarreal/discord-direct-links/issues

This policy will be updated if the extension's data handling changes. Discord Direct Links is independent and is not affiliated with or endorsed by Discord.
