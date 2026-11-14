[English](README.md) | [Русский](README.ru.md)

# tg-widget-ui

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Bot API 10.4](https://img.shields.io/badge/Telegram%20Bot%20API-10.4%20Widgets-2481cc.svg)](https://core.telegram.org/bots/api-changelog#november-9-2026)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](package.json)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D18.0.0-339933.svg)](package.json)

An ultra-lightweight, zero-dependency UI component library and HTML compiler for **Telegram HTML Widgets** introduced in [Telegram Bot API 10.4 (November 9, 2026)](https://core.telegram.org/bots/api-changelog#november-9-2026).

`#telegram` `#telegram-bot-api` `#telegram-widgets` `#html-widgets` `#bot-api-10-4` `#ui-library` `#quickjs` `#zero-dependency`

---

## Why `tg-widget-ui`?

Telegram HTML Widgets run inside a strict **QuickJS + DOM shim** sandbox (Widget Profile 1) with tight constraints:
- **Size limits**: max **32 KB** uncompressed HTML and **4 KB** compressed (`zlib` level 9).
- **No native form inputs**: `<input>`, `<select>`, and `<textarea>` are unsupported.
- **Offline sandbox**: no `fetch`, `XHR`, `WebSocket`, or external CSS/JS/fonts.
- **Native theming**: adapts to `--tg-theme-*` CSS variables and `light`/`dark` color schemes.

`tg-widget-ui` gives you ready-to-use, accessible, Telegram-native components built on `<button>` + ARIA roles (`role="checkbox"`, `role="switch"`, `role="radio"`), an event-delegated QuickJS-safe runtime, and a `buildWidget()` compiler that minifies and validates your widget against the 4 KB `zlib-9` budget.

## Features

- **Popular Components**: Lists, List Items, Buttons (primary, secondary, outline, ghost, destructive), Custom Checkboxes (with indeterminate state), Save Button (with dirty/saving/saved states), Switches, Radio Groups, Badges, Progress Bars, Cards, Banners, and Dividers.
- **Built-in `TelegramWidget` Bridge**: Automatic `TelegramWidget.request()` state submission on Save, `openLink()`, `openTelegramLink()`, and `themeChanged` / `chatDataChanged` / `publicDataChanged` listeners.
- **Accessible by Default**: ≥ 44px touch targets, `:focus-visible` outlines, `aria-checked` / `aria-disabled` / `role="progressbar"`, and `prefers-reduced-motion` support.
- **Widget Profile 1 Validator**: `validateWidget()` checks raw bytes (≤ 32 KB), `zlib` level-9 bytes (≤ 4 KB), forbidden `<input>`/`<select>`/`<textarea>` tags, external URLs, and NUL characters.

## Quick Start

```js
import {
  buildWidget,
  twHeader,
  twList,
  twCheckbox,
  twButton,
  twButtonRow,
  twSaveButton
} from "tg-widget-ui";

const { html, rawBytes, compressedBytes, withinLimits } = buildWidget({
  title: "Sprint Checklist",
  body: [
    twHeader({ title: "Release Checklist", subtitle: "Tap items to toggle" }),
    twList({
      label: "Tasks",
      items: [
        twCheckbox({ name: "tests", label: "Run unit tests", checked: true }),
        twCheckbox({ name: "deploy", label: "Send via sendWidget", checked: false })
      ]
    }),
    twButtonRow([
      twButton({ label: "Refresh", variant: "secondary", request: '{"action":"refresh"}' }),
      twSaveButton({ action: "save_checklist", label: "Save Changes" })
    ])
  ].join("")
});

console.log({ rawBytes, compressedBytes, withinLimits });
// Send `html` with Bot API `sendWidget({ chat_id, html, allow_queries: true })`
```

## Components

| Component | Purpose |
| :--- | :--- |
| `twHeader` | Widget title and optional subtitle |
| `twList` | Grouped list container with optional section label |
| `twListItem` | List row with leading icon, title, subtitle, trailing slot, and optional `request`/`link`/`tgLink` |
| `twPagedList` | Client-side paginated list with numbered pages (`1 2 ... 10`) |
| `twPagination` | Bot-driven numbered pagination bar using `TelegramWidget.request()` |
| `twMasterDetail` | Master-detail container for viewing list item details with a Back button |
| `twDetailView` | Detail screen with `← Back` button (`data-tw-back`) |
| `twEmpty` | Empty state placeholder for lists |
| `twCheckbox` | Custom `role="checkbox"` control (supports `checked`, `indeterminate`, `disabled`) |
| `twSwitch` | Toggle switch (`role="switch"`) |
| `twRadioGroup` | Single-select option group (`role="radiogroup"` + `role="radio"`) |
| `twButton` | Action button (`primary`, `secondary`, `outline`, `ghost`, `danger`, `sm`, `block`) |
| `twButtonRow` | Responsive flex row for buttons |
| `twSaveButton` | Save button / bar wired to `TelegramWidget.request()` with `Saving...` and `Saved` states |
| `twBadge` | Status pill (`neutral`, `accent`, `success`, `warning`, `danger`) |
| `twProgress` | Accessible progress bar (`role="progressbar"`) |
| `twCard` | Rounded surface container |
| `twBanner` | Status callout banner (`role="status"`) |
| `twDivider` | Hairline separator |

## Playground & Tests

Start the local interactive playground (with a mocked `TelegramWidget` runtime and light/dark theme toggle):

```bash
npm start
# or
npm run playground
```

Then open `http://127.0.0.1:4173/playground/index.html` (or open [playground/index.html](playground/index.html) directly).

```bash
# Run unit tests
npm test

# Check example widgets against the 32 KB / 4 KB zlib-9 limits
npm run check:examples
```

## Links

- [AI Agent Skill (`SKILL.md`)](skills/tg-widget-ui/SKILL.md)
- [Telegram Bot API Changelog — November 9, 2026 (Bot API 10.4)](https://core.telegram.org/bots/api-changelog#november-9-2026)
- [Contributing Guide](CONTRIBUTING.md)
- [MIT License](LICENSE)
