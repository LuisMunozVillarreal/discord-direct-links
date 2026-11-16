(() => {
  "use strict";
  function handleClick(event) {
    if (!event.isTrusted || event.defaultPrevented || event.button !== 0) return;
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest("a[href]");
    if (!(anchor instanceof HTMLAnchorElement)) return;
    let url;
    try {
      url = new URL(anchor.href);
    } catch {
      return;
    }
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return;
    const belongsTo = (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`);
    if (["discord.com", "discord.gg", "discordapp.com", "discordapp.net"].some(belongsTo)) return;
    // Leave attachment/download controls and every existing dialog to Discord.
    if (anchor.closest('[download], [role="button"], [role="dialog"], [role="alertdialog"], [aria-disabled="true"], [class*="attachment" i], [class*="download" i], [class*="fileWrapper" i], [class*="imageWrapper" i], [class*="video" i], [class*="audio" i]')) return;
    if (/download/i.test(`${anchor.getAttribute("aria-label") || ""} ${anchor.title}`)) return;
    let path;
    try {
      path = decodeURIComponent(url.pathname);
    } catch {
      return;
    }
    if (/(?:^|\/)(?:attachments?|downloads?)(?:\/|$)/i.test(path)) return;
    // File-looking URLs are intentionally conservative, including unknown types.
    const suffix = path.match(/\.([a-z0-9]{1,12})$/i)?.[1]?.toLowerCase();
    if (suffix && !["html", "htm", "php", "asp", "aspx"].includes(suffix)) return;
    if ([...url.searchParams.keys()].some((key) => /download|attachment|filename|disposition/i.test(key))) return;
    anchor.relList.add("noopener");
    // Keep the browser's default action, but skip Discord's click handlers.
    event.stopImmediatePropagation();
  }
  window.addEventListener("click", handleClick, true);
})();
