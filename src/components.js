/**
 * tg-widget-ui components
 * Zero-dependency HTML generators compliant with Telegram Widget Profile 1.
 */

const CHECK_SVG =
  '<svg class="tw-ico-check" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const DASH_SVG =
  '<svg class="tw-ico-dash" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function twHeader({ title, subtitle = "" } = {}) {
  const sub = subtitle ? `<p class="tw-sub">${esc(subtitle)}</p>` : "";
  return `<div><h2 class="tw-title">${esc(title)}</h2>${sub}</div>`;
}

export function twList({ label = "", items = [], role = "list" } = {}) {
  const head = label ? `<div class="tw-sec-label">${esc(label)}</div>` : "";
  const body = items.join("");
  return `${head}<div class="tw-list" role="${esc(role)}">${body}</div>`;
}

export function twListItem({
  title,
  subtitle = "",
  leading = "",
  trailing = "",
  request = "",
  link = "",
  tgLink = "",
  openDetail = "",
  disabled = false
} = {}) {
  const interactive = Boolean(request || link || tgLink || openDetail);
  const tag = interactive ? "button" : "div";
  const attrs = [
    interactive ? 'type="button"' : "",
    request ? `data-tw-req="${esc(request)}"` : "",
    link ? `data-tw-link="${esc(link)}"` : "",
    tgLink ? `data-tw-tg-link="${esc(tgLink)}"` : "",
    openDetail ? `data-tw-open="${esc(openDetail)}"` : "",
    disabled ? (interactive ? "disabled" : 'aria-disabled="true"') : ""
  ]
    .filter(Boolean)
    .join(" ");

  const leadHtml = leading ? `<span class="tw-item-lead">${leading}</span>` : "";
  const descHtml = subtitle ? `<span class="tw-item-desc">${esc(subtitle)}</span>` : "";
  const trailHtml = trailing ? `<span class="tw-item-trail">${trailing}</span>` : "";

  return `<${tag} class="tw-item" ${attrs}>${leadHtml}<span class="tw-item-body"><span class="tw-item-title">${esc(title)}</span>${descHtml}</span>${trailHtml}</${tag}>`;
}

export function twCheckbox({
  name,
  label,
  description = "",
  checked = false,
  indeterminate = false,
  disabled = false
} = {}) {
  const state = indeterminate ? "mixed" : checked ? "true" : "false";
  const descHtml = description ? `<span class="tw-item-desc">${esc(description)}</span>` : "";
  const dis = disabled ? ' disabled aria-disabled="true"' : "";

  return `<button type="button" class="tw-item" role="checkbox" aria-checked="${state}" data-tw-name="${esc(name)}"${dis}><span class="tw-cb-box" aria-hidden="true">${CHECK_SVG}${DASH_SVG}</span><span class="tw-item-body"><span class="tw-item-title">${esc(label)}</span>${descHtml}</span></button>`;
}

export function twSwitch({
  name,
  label,
  description = "",
  checked = false,
  disabled = false
} = {}) {
  const state = checked ? "true" : "false";
  const descHtml = description ? `<span class="tw-item-desc">${esc(description)}</span>` : "";
  const dis = disabled ? ' disabled aria-disabled="true"' : "";

  return `<button type="button" class="tw-item" role="switch" aria-checked="${state}" data-tw-name="${esc(name)}"${dis}><span class="tw-item-body"><span class="tw-item-title">${esc(label)}</span>${descHtml}</span><span class="tw-sw-track" aria-hidden="true"><span class="tw-sw-thumb"></span></span></button>`;
}

export function twRadioGroup({ name, label = "", options = [], value = null, disabled = false } = {}) {
  const head = label ? `<div class="tw-sec-label">${esc(label)}</div>` : "";
  const dis = disabled ? ' disabled aria-disabled="true"' : "";
  const rows = options
    .map((opt) => {
      const checked = opt.value === value ? "true" : "false";
      const desc = opt.description ? `<span class="tw-item-desc">${esc(opt.description)}</span>` : "";
      return `<button type="button" class="tw-item" role="radio" aria-checked="${checked}" data-tw-value="${esc(opt.value)}"${dis}><span class="tw-rd-dot" aria-hidden="true"></span><span class="tw-item-body"><span class="tw-item-title">${esc(opt.label)}</span>${desc}</span></button>`;
    })
    .join("");
  return `${head}<div class="tw-list" role="radiogroup" data-tw-name="${esc(name)}">${rows}</div>`;
}

export function twButton({
  label,
  variant = "primary",
  size = "md",
  block = false,
  request = "",
  link = "",
  tgLink = "",
  lock = false,
  loadingLabel = "",
  disabled = false
} = {}) {
  const variantClass = {
    primary: "",
    secondary: "tw-btn-sec",
    outline: "tw-btn-out",
    ghost: "tw-btn-ghost",
    danger: "tw-btn-danger"
  }[variant] || "";

  const classes = [
    "tw-btn",
    variantClass,
    size === "sm" ? "tw-btn-sm" : "",
    block ? "tw-btn-block" : ""
  ]
    .filter(Boolean)
    .join(" ");

  const attrs = [
    request ? `data-tw-req="${esc(request)}"` : "",
    link ? `data-tw-link="${esc(link)}"` : "",
    tgLink ? `data-tw-tg-link="${esc(tgLink)}"` : "",
    lock ? "data-tw-lock" : "",
    loadingLabel ? `data-tw-loading="${esc(loadingLabel)}"` : "",
    disabled ? "disabled" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return `<button type="button" class="${classes}" ${attrs}>${esc(label)}</button>`;
}

export function twButtonRow(buttons = []) {
  return `<div class="tw-btn-row">${buttons.join("")}</div>`;
}

export function twSaveButton({
  action = "save",
  label = "Save",
  savingLabel = "Saving...",
  savedLabel = "Saved",
  errorLabel = "Error",
  statusText = "",
  autoDisable = false,
  lock = false,
  block = false
} = {}) {
  const cls = ["tw-btn", block ? "tw-btn-block" : ""].filter(Boolean).join(" ");
  const dis = autoDisable ? " data-tw-auto-disable disabled" : "";
  const lk = lock ? " data-tw-lock" : "";
  const btn = `<button type="button" class="${cls}" data-tw-save="${esc(action)}" data-tw-label="${esc(label)}" data-tw-saving="${esc(savingLabel)}" data-tw-saved="${esc(savedLabel)}" data-tw-error="${esc(errorLabel)}"${dis}${lk}>${esc(label)}</button>`;

  if (!statusText) return btn;
  return `<div class="tw-save-bar"><span class="tw-save-status">${esc(statusText)}</span>${btn}</div>`;
}

export function twBadge({ text, variant = "neutral" } = {}) {
  const v = {
    neutral: "",
    accent: "tw-badge-accent",
    success: "tw-badge-ok",
    warning: "tw-badge-warn",
    danger: "tw-badge-err"
  }[variant] || "";
  return `<span class="tw-badge ${v}">${esc(text)}</span>`.replace("  ", " ");
}

export function twProgress({ value = 0, max = 100, label = "Progress" } = {}) {
  const pct = Math.max(0, Math.min(100, (Number(value) / Number(max || 100)) * 100));
  return `<div class="tw-prog" role="progressbar" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${esc(max)}" aria-valuenow="${esc(value)}"><div class="tw-prog-fill" style="width:${pct.toFixed(1)}%"></div></div>`;
}

export function twCard({ title = "", content = "" } = {}) {
  const head = title ? `<h3 class="tw-title" style="margin-bottom:6px">${esc(title)}</h3>` : "";
  return `<div class="tw-card">${head}${content}</div>`;
}

export function twBanner({ text } = {}) {
  return `<div class="tw-banner" role="status">${esc(text)}</div>`;
}

export function twDivider() {
  return '<hr class="tw-divider">';
}

export function twEmpty({ title = "Nothing here", subtitle = "" } = {}) {
  const sub = subtitle ? `<div class="tw-sub">${esc(subtitle)}</div>` : "";
  return `<div class="tw-empty"><div class="tw-item-title">${esc(title)}</div>${sub}</div>`;
}

export function pageRange(cur, total) {
  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  const left = Math.max(2, cur - 1);
  const right = Math.min(total - 1, cur + 1);
  if (left > 2) pages.push("...");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export function twPagination({
  page = 1,
  totalPages = 1,
  prevLabel = "‹",
  nextLabel = "›",
  action = "page",
  lock = true
} = {}) {
  const p = Math.max(1, Number(page));
  const total = Math.max(1, Number(totalPages));
  const lk = lock ? " data-tw-lock" : "";
  const prevReq = JSON.stringify({ action, page: p - 1 });
  const nextReq = JSON.stringify({ action, page: p + 1 });
  const prevBtn = `<button type="button" class="tw-btn tw-btn-sm tw-btn-sec"${p <= 1 ? " disabled" : ` data-tw-req="${esc(prevReq)}"${lk}`}>${esc(prevLabel)}</button>`;
  const nextBtn = `<button type="button" class="tw-btn tw-btn-sm tw-btn-sec"${p >= total ? " disabled" : ` data-tw-req="${esc(nextReq)}"${lk}`}>${esc(nextLabel)}</button>`;
  const nums = pageRange(p, total)
    .map((n) =>
      n === "..."
        ? '<span class="tw-pg-dots">...</span>'
        : `<button type="button" class="tw-pg-num${n === p ? " tw-pg-act" : ""}"${n === p ? ' aria-current="page"' : ` data-tw-req="${esc(JSON.stringify({ action, page: n }))}"${lk}`}>${n}</button>`
    )
    .join("");
  return `<div class="tw-pager">${prevBtn}<div class="tw-pager-nums">${nums}</div>${nextBtn}</div>`;
}

export function twPagedList({
  label = "",
  items = [],
  pageSize = 5,
  page = 1,
  prevLabel = "‹",
  nextLabel = "›",
  emptyText = "Empty",
  lock = false
} = {}) {
  if (!items.length) {
    return twList({ label, items: [twEmpty({ title: emptyText })] });
  }
  const size = Math.max(1, Number(pageSize));
  const total = Math.max(1, Math.ceil(items.length / size));
  const cur = Math.max(1, Math.min(total, Number(page)));
  const lk = lock ? ` data-tw-lock="${typeof lock === "number" ? lock : 300}"` : "";
  const nums = pageRange(cur, total)
    .map((n) =>
      n === "..."
        ? '<span class="tw-pg-dots">...</span>'
        : `<button type="button" class="tw-pg-num${n === cur ? " tw-pg-act" : ""}" data-tw-page-btn="${n}"${n === cur ? ' aria-current="page"' : ""}>${n}</button>`
    )
    .join("");
  const pager =
    total > 1
      ? `<div class="tw-pager"><button type="button" class="tw-btn tw-btn-sm tw-btn-sec" data-tw-prev${cur <= 1 ? " disabled" : ""}>${esc(prevLabel)}</button><div class="tw-pager-nums">${nums}</div><button type="button" class="tw-btn tw-btn-sm tw-btn-sec" data-tw-next${cur >= total ? " disabled" : ""}>${esc(nextLabel)}</button></div>`
      : "";
  return `<div class="tw-root" data-tw-paged data-tw-size="${size}" data-tw-page="${cur}"${lk}>${twList({ label, items })}${pager}</div>`;
}

export function twDetailView({ id, title = "", backLabel = "Back", content = "" } = {}) {
  const head = `<div class="tw-detail-head"><button type="button" class="tw-btn tw-btn-sm tw-btn-sec" data-tw-back>&larr; ${esc(backLabel)}</button>${title ? `<h3 class="tw-title">${esc(title)}</h3>` : ""}</div>`;
  return `<div class="tw-root" data-tw-view="${esc(id)}" hidden>${head}${content}</div>`;
}

export function twMasterDetail({ master = "", details = [] } = {}) {
  return `<div class="tw-root" data-tw-md><div class="tw-root" data-tw-master>${master}</div>${details.join("")}</div>`;
}

export function twTabs({ tabs = [], activeId = "", label = "Tabs" } = {}) {
  if (!tabs.length) return "";
  const active = tabs.some((t) => t.id === activeId) ? activeId : tabs[0].id;
  const bar = tabs
    .map((t) => {
      const sel = t.id === active;
      return `<button type="button" class="tw-tab" role="tab" aria-selected="${sel ? "true" : "false"}" data-tw-tab="${esc(t.id)}">${esc(t.label)}</button>`;
    })
    .join("");
  const panels = tabs
    .map((t) => {
      const sel = t.id === active;
      return `<div class="tw-tab-panel" role="tabpanel" data-tw-panel="${esc(t.id)}"${sel ? "" : " hidden"}>${t.content || ""}</div>`;
    })
    .join("");
  return `<div class="tw-tabs" data-tw-tabs><div class="tw-tablist" role="tablist" aria-label="${esc(label)}">${bar}</div>${panels}</div>`;
}

export function twAccordion({ items = [], label = "" } = {}) {
  const head = label ? `<div class="tw-sec-label">${esc(label)}</div>` : "";
  const rows = items
    .map((item) => {
      const open = Boolean(item.open);
      const sub = item.subtitle ? `<span class="tw-item-desc">${esc(item.subtitle)}</span>` : "";
      return `<div class="tw-acc-item"><button type="button" class="tw-acc-btn" aria-expanded="${open ? "true" : "false"}" data-tw-acc><span class="tw-item-body"><span class="tw-item-title">${esc(item.title)}</span>${sub}</span><span class="tw-acc-ico" aria-hidden="true">&#9662;</span></button><div class="tw-acc-panel"${open ? "" : " hidden"}>${item.content || ""}</div></div>`;
    })
    .join("");
  return `${head}<div class="tw-acc">${rows}</div>`;
}

export function twStepper({
  name,
  label,
  description = "",
  value = 0,
  min = 0,
  max = 99,
  step = 1,
  unit = "",
  disabled = false
} = {}) {
  const val = Math.max(Number(min), Math.min(Number(max), Number(value)));
  const descHtml = description ? `<span class="tw-item-desc">${esc(description)}</span>` : "";
  const unitAttr = unit ? ` data-tw-unit="${esc(unit)}"` : "";
  const disMinus = disabled || val <= min ? " disabled" : "";
  const disPlus = disabled || val >= max ? " disabled" : "";
  const display = unit ? `${val} ${esc(unit)}` : `${val}`;
  return `<div class="tw-item tw-stepper" data-tw-name="${esc(name)}" data-tw-stepper data-tw-val="${val}" data-tw-min="${min}" data-tw-max="${max}" data-tw-step-by="${step}"${unitAttr}${disabled ? ' aria-disabled="true"' : ""}><span class="tw-item-body"><span class="tw-item-title">${esc(label)}</span>${descHtml}</span><span class="tw-step-ctrl"><button type="button" class="tw-step-btn" data-tw-step="-1" aria-label="Decrease ${esc(label)}"${disMinus}>&minus;</button><span class="tw-step-val">${display}</span><button type="button" class="tw-step-btn" data-tw-step="1" aria-label="Increase ${esc(label)}"${disPlus}>+</button></span></div>`;
}

export function twChipGroup({
  name,
  label = "",
  options = [],
  value = null,
  multiple = false,
  disabled = false
} = {}) {
  const head = label ? `<div class="tw-sec-label">${esc(label)}</div>` : "";
  const selected = new Set(Array.isArray(value) ? value : value !== null && value !== undefined ? [value] : []);
  const multiAttr = multiple ? " data-tw-multi" : "";
  const chips = options
    .map((opt) => {
      const pressed = selected.has(opt.value) ? "true" : "false";
      const dis = disabled || opt.disabled ? " disabled" : "";
      return `<button type="button" class="tw-chip" data-tw-chip data-tw-value="${esc(opt.value)}" aria-pressed="${pressed}"${dis}>${esc(opt.label)}</button>`;
    })
    .join("");
  return `${head}<div class="tw-chips" role="group"${label ? ` aria-label="${esc(label)}"` : ""} data-tw-name="${esc(name)}" data-tw-chips${multiAttr}>${chips}</div>`;
}

export function twStatGrid({ items = [], columns = 2 } = {}) {
  const cols = Math.max(1, Math.min(4, Number(columns) || 2));
  const cards = items
    .map((item) => {
      const cls = {
        accent: " tw-stat-accent",
        success: " tw-stat-ok",
        warning: " tw-stat-warn",
        danger: " tw-stat-err"
      }[item.variant] || "";
      const hint = item.hint ? `<div class="tw-stat-hint">${esc(item.hint)}</div>` : "";
      return `<div class="tw-stat${cls}"><div class="tw-stat-label">${esc(item.label)}</div><div class="tw-stat-val">${esc(item.value)}</div>${hint}</div>`;
    })
    .join("");
  return `<div class="tw-stats" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${cards}</div>`;
}

export function twAvatar({ name = "", src = "", size = "md" } = {}) {
  const sz = { sm: "tw-av-sm", md: "", lg: "tw-av-lg" }[size] || "";
  const cls = ["tw-avatar", sz].filter(Boolean).join(" ");
  if (src) {
    return `<span class="${cls}"><img src="${esc(src)}" alt="${esc(name)}"></span>`;
  }
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (parts[0] ? parts[0].slice(0, 2).toUpperCase() : "?");
  return `<span class="${cls}" aria-hidden="true">${esc(initials)}</span>`;
}

export function twLoadingOverlay({ text = "Loading..." } = {}) {
  return `<div class="tw-overlay" data-tw-overlay hidden role="status" aria-live="polite" aria-busy="true"><div class="tw-overlay-box"><span class="tw-spinner" aria-hidden="true"></span><span class="tw-overlay-text">${esc(text)}</span></div></div>`;
}
