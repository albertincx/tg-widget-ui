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
  disabled = false
} = {}) {
  const interactive = Boolean(request || link || tgLink);
  const tag = interactive ? "button" : "div";
  const attrs = [
    interactive ? 'type="button"' : "",
    request ? `data-tw-req="${esc(request)}"` : "",
    link ? `data-tw-link="${esc(link)}"` : "",
    tgLink ? `data-tw-tg-link="${esc(tgLink)}"` : "",
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
  block = false
} = {}) {
  const cls = ["tw-btn", block ? "tw-btn-block" : ""].filter(Boolean).join(" ");
  const dis = autoDisable ? " data-tw-auto-disable disabled" : "";
  const btn = `<button type="button" class="${cls}" data-tw-save="${esc(action)}" data-tw-label="${esc(label)}" data-tw-saving="${esc(savingLabel)}" data-tw-saved="${esc(savedLabel)}" data-tw-error="${esc(errorLabel)}"${dis}>${esc(label)}</button>`;

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

export function twPagination({
  page = 1,
  totalPages = 1,
  prevLabel = "Prev",
  nextLabel = "Next",
  action = "page"
} = {}) {
  const p = Math.max(1, Number(page));
  const total = Math.max(1, Number(totalPages));
  const prevReq = JSON.stringify({ action, page: p - 1 });
  const nextReq = JSON.stringify({ action, page: p + 1 });
  const prevBtn = `<button type="button" class="tw-btn tw-btn-sm tw-btn-sec"${p <= 1 ? " disabled" : ` data-tw-req="${esc(prevReq)}"`}>${esc(prevLabel)}</button>`;
  const nextBtn = `<button type="button" class="tw-btn tw-btn-sm tw-btn-sec"${p >= total ? " disabled" : ` data-tw-req="${esc(nextReq)}"`}>${esc(nextLabel)}</button>`;
  return `<div class="tw-pager">${prevBtn}<span class="tw-pager-info">${p} / ${total}</span>${nextBtn}</div>`;
}

export function twPagedList({
  label = "",
  items = [],
  pageSize = 5,
  page = 1,
  prevLabel = "Prev",
  nextLabel = "Next",
  emptyText = "Empty"
} = {}) {
  if (!items.length) {
    return twList({ label, items: [twEmpty({ title: emptyText })] });
  }
  const size = Math.max(1, Number(pageSize));
  const total = Math.max(1, Math.ceil(items.length / size));
  const cur = Math.max(1, Math.min(total, Number(page)));
  const pager =
    total > 1
      ? `<div class="tw-pager"><button type="button" class="tw-btn tw-btn-sm tw-btn-sec" data-tw-prev${cur <= 1 ? " disabled" : ""}>${esc(prevLabel)}</button><span class="tw-pager-info">${cur} / ${total}</span><button type="button" class="tw-btn tw-btn-sm tw-btn-sec" data-tw-next${cur >= total ? " disabled" : ""}>${esc(nextLabel)}</button></div>`
      : "";
  return `<div class="tw-root" data-tw-paged data-tw-size="${size}" data-tw-page="${cur}">${twList({ label, items })}${pager}</div>`;
}
