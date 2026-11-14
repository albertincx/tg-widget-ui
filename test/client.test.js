import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientCode = fs.readFileSync(path.join(__dirname, "..", "src", "client.js"), "utf8");

function createMockEnv(requestImpl) {
  const listeners = {};
  const saveBtnClasses = new Set();
  const saveBtn = {
    disabled: false,
    textContent: "Save",
    classList: {
      add: (...c) => c.forEach((x) => saveBtnClasses.add(x)),
      remove: (...c) => c.forEach((x) => saveBtnClasses.delete(x)),
      has: (c) => saveBtnClasses.has(c)
    },
    hasAttribute: (k) => k === "data-tw-save",
    getAttribute: (k) =>
      ({
        "data-tw-save": "save_test",
        "data-tw-label": "Save",
        "data-tw-saving": "Saving...",
        "data-tw-saved": "Saved",
        "data-tw-error": "Error"
      })[k] || null
  };

  const sandbox = {
    Promise,
    JSON,
    TelegramWidget: {
      request: requestImpl,
      onEvent: () => {}
    },
    document: {
      documentElement: { style: { setProperty: () => {} } },
      addEventListener: (ev, fn) => {
        listeners[ev] = fn;
      },
      querySelectorAll: (sel) => {
        if (sel === "[data-tw-save]") return [saveBtn];
        return [];
      }
    }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(clientCode, sandbox);
  return { TwUI: sandbox.TwUI, listeners, saveBtn, saveBtnClasses };
}

test("runtime handles empty responses (undefined, null, empty string) without throwing", async () => {
  for (const emptyVal of [undefined, null, ""]) {
    const { TwUI } = createMockEnv(() => Promise.resolve(emptyVal));
    const res = await TwUI.request({ action: "ping" });
    assert.equal(res, emptyVal);
  }
});

test("runtime rejects { ok: false } and transitions save button to error state", async () => {
  const { TwUI, listeners, saveBtn, saveBtnClasses } = createMockEnv(() =>
    Promise.resolve({ ok: false, error: "quota" })
  );
  let capturedErr = null;
  TwUI.on("error", (e) => {
    capturedErr = e;
  });

  listeners.click({ target: saveBtn });
  await new Promise((r) => setTimeout(r, 10));

  assert.deepEqual(capturedErr, { ok: false, error: "quota" });
  assert.equal(saveBtn.disabled, false);
  assert.equal(saveBtn.textContent, "Error");
  assert.equal(saveBtnClasses.has("tw-btn-danger"), true);

  TwUI.setDirty(true);
  assert.equal(saveBtnClasses.has("tw-btn-danger"), false);
  assert.equal(saveBtn.textContent, "Save");
});

test("runtime catches synchronous throws and async rejections from TelegramWidget.request", async () => {
  const syncEnv = createMockEnv(() => {
    throw new Error("sync boom");
  });
  await assert.rejects(() => syncEnv.TwUI.request("x"), /sync boom/);

  const asyncEnv = createMockEnv(() => Promise.reject(new Error("async boom")));
  await assert.rejects(() => asyncEnv.TwUI.request("x"), /async boom/);
});
