const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { JSDOM } = require("jsdom");

function setup(markup, page = "https://discord.com/channels/@me") {
  const dom = new JSDOM(markup, { url: page, runScripts: "outside-only" });
  const listeners = new Map();
  dom.window.addEventListener = (name, handler, capture) => {
    assert.equal(capture, true);
    listeners.set(name, handler);
  };
  dom.window.eval(readFileSync("extension/content.js", "utf8"));
  const anchor = dom.window.document.querySelector("a");
  function activate(overrides = {}, type = "click") {
    let stopped = false;
    let prevented = false;
    const target = anchor?.firstElementChild || anchor || dom.window.document.body;
    const event = {
      target, button: 0, isTrusted: true, defaultPrevented: false,
      composedPath: () => [target, anchor].filter(Boolean),
      stopImmediatePropagation: () => { stopped = true; },
      preventDefault: () => { prevented = true; },
      ...overrides
    };
    listeners.get(type)?.(event);
    return { stopped, prevented };
  }
  return { dom, anchor, activate };
}

test("ordinary external link bypasses page click handlers without canceling native navigation", () => {
  const { anchor, activate } = setup('<a href="https://example.com/guide" target="_blank"><span>Guide</span></a>');
  assert.deepEqual(activate(), { stopped: true, prevented: false });
  assert.ok(anchor.relList.contains("noopener"));
  assert.equal(anchor.target, "_blank");
  assert.equal(anchor.href, "https://example.com/guide");
});

for (const href of ["/channels/123/456", "https://discord.com/channels/@me", "https://ptb.discord.com/channels/@me", "https://discord.gg/example", "https://support.discord.com/", "mailto:a@example.com", "javascript:void(0)", "data:text/plain,hello", "#message", "https://user:pass@example.com/"]) {
  test(`leaves internal, non-web or credential-bearing URL alone: ${href}`, () => {
    const { anchor, activate } = setup(`<a href="${href}">Link</a>`);
    assert.deepEqual(activate(), { stopped: false, prevented: false });
    assert.equal(anchor.rel, "");
  });
}

test("ignores synthetic, canceled and right-click events", () => {
  const { activate } = setup('<a href="https://example.com/">Link</a>');
  for (const overrides of [{ isTrusted: false }, { defaultPrevented: true }, { button: 2 }]) {
    assert.deepEqual(activate(overrides), { stopped: false, prevented: false });
  }
});

test("ignores non-link targets and text-node targets safely", () => {
  const { dom, activate } = setup('<div>Text</div>');
  assert.deepEqual(activate(), { stopped: false, prevented: false });
  assert.doesNotThrow(() => activate({ target: dom.window.document.createTextNode('text') }));
});

const downloadCases = [
  '<a href="https://example.com/file" download>Save</a>',
  '<a href="https://cdn.discordapp.com/attachments/1/2/file">File</a>',
  '<a href="https://media.discordapp.net/external/image">Image</a>',
  '<a href="https://example.com/attachments/1/file">File</a>',
  '<a href="https://example.com/a.ZIP?x=1">File</a>',
  '<a href="https://example.com/a%2Eexe">File</a>',
  '<a href="https://example.com/download?id=1">File</a>',
  '<a href="https://example.com/file?download=1">File</a>',
  '<div class="attachment_abc"><a href="https://example.com/opaque">File</a></div>',
  '<a role="button" href="https://example.com/opaque">Save</a>',
  '<div role="dialog"><a href="https://example.com/opaque">Confirm</a></div>',
  '<a href="https://example.com/" aria-label="Download file">Save</a>',
  '<a href="https://example.com/" aria-disabled="true">Disabled</a>'
];
for (const markup of downloadCases) {
  test(`preserves download and dialog handlers: ${markup}`, () => {
    const { activate } = setup(markup);
    assert.deepEqual(activate(), { stopped: false, prevented: false });
  });
}

module.exports = { setup };
