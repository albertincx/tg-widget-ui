import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { esc } from "./components.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const WIDGET_MAX_RAW_BYTES = 32 * 1024; // 32 KB
export const WIDGET_MAX_ZLIB_BYTES = 4 * 1024; // 4 KB (zlib level 9)

export function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

export function minifyJs(js) {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}();,:])\s*/g, "$1")
    .trim();
}

export function validateWidget(html) {
  const errors = [];
  const warnings = [];

  if (html.includes("\u0000")) {
    errors.push("HTML contains NUL character (U+0000), which Telegram rejects (INPUT_MEDIA_WIDGET_HTML_INVALID).");
  }

  if (/<(input|select|textarea)\b/i.test(html)) {
    errors.push("HTML contains native form controls (<input>, <select>, or <textarea>), which are unsupported in Widget Profile 1.");
  }

  if (/<(script|link)\b[^>]+\b(src|href)\s*=\s*["']https?:\/\//i.test(html)) {
    errors.push("HTML references external scripts or stylesheets, which are blocked in the offline QuickJS widget sandbox.");
  }

  const rawBuf = Buffer.from(html, "utf8");
  const compressedBuf = zlib.deflateSync(rawBuf, { level: 9 });
  const rawBytes = rawBuf.length;
  const compressedBytes = compressedBuf.length;

  if (rawBytes > WIDGET_MAX_RAW_BYTES) {
    errors.push(`Uncompressed HTML (${rawBytes} B) exceeds Telegram 32 KB limit (${WIDGET_MAX_RAW_BYTES} B).`);
  }
  if (compressedBytes > WIDGET_MAX_ZLIB_BYTES) {
    errors.push(`Compressed HTML (${compressedBytes} B zlib-9) exceeds Telegram 4 KB limit (${WIDGET_MAX_ZLIB_BYTES} B).`);
  }

  if (compressedBytes > WIDGET_MAX_ZLIB_BYTES * 0.85 && compressedBytes <= WIDGET_MAX_ZLIB_BYTES) {
    warnings.push(`Compressed size (${compressedBytes} B) is above 85% of the 4 KB limit.`);
  }

  return {
    rawBytes,
    compressedBytes,
    withinLimits: errors.length === 0,
    errors,
    warnings
  };
}

const SECTION_MATCHERS = {
  card: /tw-card/,
  list: /tw-list|tw-item/,
  checkbox: /tw-cb-box/,
  switch: /tw-sw-track/,
  radio: /tw-rd-dot/,
  button: /tw-btn/,
  save: /tw-save-/,
  badge: /tw-badge/,
  progress: /tw-prog/,
  banner: /tw-banner/,
  divider: /tw-divider/,
  pager: /tw-pager/,
  detail: /tw-detail-head/,
  empty: /tw-empty/
};

export function pruneCss(css, html) {
  return css.replace(/\/\*\s*@section\s+(\w+)\s*\*\/([\s\S]*?)(?=\/\*\s*@section\s+)/g, (full, name, block) => {
    const rx = SECTION_MATCHERS[name];
    return !rx || rx.test(html) ? block : "";
  });
}

export function pruneJs(js, html) {
  let out = js;
  if (!/data-tw-paged/.test(html)) {
    out = out.replace(/\/\*\s*@section\s+paged\s*\*\/[\s\S]*?\/\*\s*@section\s+end\s*\*\//g, "");
  }
  if (!/data-tw-open/.test(html)) {
    out = out.replace(/\/\*\s*@section\s+detail\s*\*\/[\s\S]*?\/\*\s*@section\s+end\s*\*\//g, "");
  }
  return out;
}

export function buildWidget({
  title = "Telegram Widget",
  lang = "en",
  body = "",
  customCss = "",
  customJs = "",
  includeRuntime = true,
  treeShake = true
} = {}) {
  const rawCss = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
  const baseCss = treeShake ? pruneCss(rawCss, body) : rawCss;
  const rawJs = includeRuntime ? fs.readFileSync(path.join(__dirname, "runtime.js"), "utf8") : "";
  const baseJs = treeShake && rawJs ? pruneJs(rawJs, body) : rawJs;

  const css = minifyCss(`${baseCss}\n${customCss}`);
  const js = minifyJs(`${baseJs}\n${customJs}`);

  const html =
    `<!DOCTYPE html><html lang="${esc(lang)}"><head>` +
    `<meta charset="utf-8">` +
    `<meta name="color-scheme" content="light dark">` +
    `<title>${esc(title)}</title>` +
    `<style>${css}</style>` +
    `</head><body>` +
    `<main class="tw-root">${body}</main>` +
    (js ? `<script>${js}</script>` : "") +
    `</body></html>`;

  const report = validateWidget(html);
  return { html, ...report };
}
