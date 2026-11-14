# Contributing to tg-widget-ui

Thank you for your interest in contributing to **tg-widget-ui**!

## Design Constraints (Telegram Widget Profile 1)

All components and runtime code must strictly respect the [Telegram Bot API 10.4 HTML Widgets](https://core.telegram.org/bots/api-changelog#november-9-2026) sandbox rules:

1. **Size budget**: Compiled widgets must stay under **32 KB** uncompressed and **4 KB** zlib (level 9) compressed.
2. **Zero external dependencies**: No external CSS, JS, fonts, or `fetch`/`XHR`/`WebSocket` calls.
3. **No native form inputs**: `<input>`, `<select>`, and `<textarea>` are unsupported in Widget Profile 1. Use `<button>` with proper `role` and `aria-*` attributes.
4. **Theme compatibility**: Use `--tg-theme-*` CSS custom properties with accessible light/dark fallbacks.
5. **Accessibility**: Maintain ≥ 44px touch targets, `:focus-visible` indicators, and semantic ARIA roles/states.

## Development Workflow

```bash
# Run unit tests
npm test

# Verify example widgets against the 4 KB zlib-9 budget
npm run check:examples
```

## Pull Requests

- Keep changes focused and well-tested.
- Run `npm test` and `npm run check:examples` before submitting.
- Update `README.md` and `README.ru.md` if you add or change public APIs.
