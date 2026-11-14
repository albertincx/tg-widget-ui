import test from "node:test";
import assert from "node:assert/strict";
import {
  buildWidget,
  validateWidget,
  WIDGET_MAX_RAW_BYTES,
  WIDGET_MAX_ZLIB_BYTES,
  twHeader,
  twList,
  twCheckbox,
  twButton,
  twSaveButton
} from "../src/index.js";

test("buildWidget compiles full interactive widget under 32 KB raw and 4 KB zlib-9", () => {
  const body = [
    twHeader({ title: "Checklist", subtitle: "Bot API 10.4" }),
    twList({
      label: "Items",
      items: [
        twCheckbox({ name: "a", label: "First item", checked: true }),
        twCheckbox({ name: "b", label: "Second item", checked: false })
      ]
    }),
    twButton({ label: "Reset", variant: "secondary", request: '{"action":"reset"}' }),
    twSaveButton({ action: "save", label: "Save" })
  ].join("");

  const out = buildWidget({ title: "Checklist", body });
  assert.equal(out.withinLimits, true, `Errors: ${out.errors.join("; ")}`);
  assert.ok(out.rawBytes <= WIDGET_MAX_RAW_BYTES);
  assert.ok(out.compressedBytes <= WIDGET_MAX_ZLIB_BYTES);
  assert.match(out.html, /<meta name="color-scheme" content="light dark">/);
  assert.match(out.html, /TelegramWidget/);
});

test("validateWidget rejects forbidden native <input>, NUL bytes, and external URLs", () => {
  const badInput = validateWidget('<html><body><input type="checkbox"></body></html>');
  assert.equal(badInput.withinLimits, false);
  assert.ok(badInput.errors.some((e) => e.includes("<input>")));

  const badNul = validateWidget("<html><body>\u0000</body></html>");
  assert.equal(badNul.withinLimits, false);
  assert.ok(badNul.errors.some((e) => e.includes("NUL")));

  const badExternal = validateWidget('<html><head><script src="https://example.com/a.js"></script></head></html>');
  assert.equal(badExternal.withinLimits, false);
  assert.ok(badExternal.errors.some((e) => e.includes("external")));
});
