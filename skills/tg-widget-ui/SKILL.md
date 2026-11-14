---
name: tg-widget-ui
description: |
  Build, compile, and validate Telegram HTML Widgets (Bot API 10.4) using tg-widget-ui.
  Use whenever the user asks to create an interactive Telegram message widget, sendWidget payload,
  checklist, settings panel, paged list, or TelegramWidget UI without native form inputs.
---

# tg-widget-ui Skill

Use `tg-widget-ui` to build self-contained, accessible **Telegram HTML Widgets** compliant with **Bot API 10.4 (Widget Profile 1)**.

Official spec: https://core.telegram.org/bots/api-changelog#november-9-2026

## Hard Constraints (Widget Profile 1)

1. **Size budget**: Uncompressed HTML **≤ 32 KB** (32,768 B); `zlib` level-9 compressed **≤ 4 KB** (4,096 B).
2. **No native form controls**: Never emit `<input>`, `<select>`, or `<textarea>`. Use `twCheckbox`, `twSwitch`, `twRadioGroup`, and `twButton` (built on `<button>` + ARIA roles).
3. **Offline QuickJS sandbox**: No `fetch`, `XMLHttpRequest`, `WebSocket`, external `<script src>`, external `<link>`, or web fonts.
4. **No NUL bytes**: Never include `\u0000`.
5. **Layout & theming**: Max height ~600 px with no internal scrolling (use `twPagedList` for long lists). Style via `--tg-theme-*` CSS variables.

## Workflow

1. **Compose UI** using `tg-widget-ui` components:
   - Layout & Lists: `twHeader`, `twList`, `twListItem`, `twPagedList`, `twPagination`, `twEmpty`, `twCard`, `twDivider`, `twBanner`
   - Controls: `twCheckbox` (`checked`, `indeterminate`), `twSwitch`, `twRadioGroup`, `twButton`, `twButtonRow`, `twSaveButton`
   - Indicators: `twBadge`, `twProgress`
2. **Compile & Validate** with `buildWidget({ title, lang, body, customCss, customJs })`:
   - Always check `result.withinLimits === true` before passing `result.html` to `sendWidget`.
   - `buildWidget()` automatically tree-shakes unused CSS/JS sections and checks the 32 KB / 4 KB `zlib-9` budget.
3. **Handle `TelegramWidget` responses**:
   - `twSaveButton` automatically collects `[data-tw-name]` state and calls `TelegramWidget.request(JSON.stringify({ action, state }))`.
   - Empty responses (`undefined`, `null`, `""`) are treated as non-fatal; `{ ok: false }` or thrown/rejected errors transition the save button to `.tw-btn-danger` (`Error`) and emit `TwUI.on("error", err)`.

## Minimal Example

```js
import {
  buildWidget,
  twHeader,
  twPagedList,
  twCheckbox,
  twSaveButton
} from "tg-widget-ui";

const { html, compressedBytes, withinLimits, errors } = buildWidget({
  title: "Tasks",
  body: [
    twHeader({ title: "Daily Tasks", subtitle: "Tap to toggle" }),
    twPagedList({
      label: "Items",
      pageSize: 4,
      items: [
        twCheckbox({ name: "t1", label: "Review PRs", checked: true }),
        twCheckbox({ name: "t2", label: "Run tests", checked: false })
      ]
    }),
    twSaveButton({ action: "save_tasks", label: "Save" })
  ].join("")
});

if (!withinLimits) throw new Error(errors.join("; "));
```
