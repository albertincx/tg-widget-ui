import test from "node:test";
import assert from "node:assert/strict";
import {
  esc,
  twHeader,
  twList,
  twListItem,
  twCheckbox,
  twSwitch,
  twRadioGroup,
  twButton,
  twButtonRow,
  twSaveButton,
  twBadge,
  twProgress,
  twCard,
  twBanner,
  twDivider,
  twEmpty,
  twPagination,
  twPagedList,
  twDetailView,
  twMasterDetail,
  pageRange
} from "../src/index.js";

test("esc escapes HTML special characters", () => {
  assert.equal(esc('<script>"&\''), "&lt;script&gt;&quot;&amp;&#39;");
});

test("twCheckbox renders accessible button without <input>", () => {
  const html = twCheckbox({
    name: "agree",
    label: "Accept <terms>",
    description: "Required",
    checked: true
  });
  assert.ok(!/<input/i.test(html));
  assert.match(html, /role="checkbox"/);
  assert.match(html, /aria-checked="true"/);
  assert.match(html, /data-tw-name="agree"/);
  assert.match(html, /Accept &lt;terms&gt;/);
});

test("twCheckbox supports indeterminate mixed state", () => {
  const html = twCheckbox({ name: "all", label: "Select all", indeterminate: true });
  assert.match(html, /aria-checked="mixed"/);
});

test("twSwitch renders role=switch with aria-checked", () => {
  const html = twSwitch({ name: "alerts", label: "Alerts", checked: false });
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="false"/);
});

test("twRadioGroup marks selected option aria-checked=true", () => {
  const html = twRadioGroup({
    name: "plan",
    label: "Plan",
    value: "pro",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" }
    ]
  });
  assert.match(html, /role="radiogroup"/);
  assert.match(html, /data-tw-value="free"[^>]*aria-checked="false"|aria-checked="false"[^>]*data-tw-value="free"/);
  assert.match(html, /data-tw-value="pro"[^>]*aria-checked="true"|aria-checked="true"[^>]*data-tw-value="pro"/);
});

test("twList and twListItem render interactive and static items", () => {
  const html = twList({
    label: "Menu",
    items: [
      twListItem({ title: "Static" }),
      twListItem({ title: "Action", request: '{"op":"ping"}', trailing: twBadge({ text: "New", variant: "accent" }) })
    ]
  });
  assert.match(html, /<div class="tw-item" >Static|<div class="tw-item".*Static/);
  assert.match(html, /<button class="tw-item" type="button"/);
  assert.match(html, /data-tw-req=/);
  assert.match(html, /tw-badge-accent/);
});

test("twSaveButton renders save bar with statusText and autoDisable", () => {
  const html = twSaveButton({
    action: "save_cfg",
    label: "Save",
    statusText: "Unsaved",
    autoDisable: true
  });
  assert.match(html, /tw-save-bar/);
  assert.match(html, /data-tw-save="save_cfg"/);
  assert.match(html, /data-tw-auto-disable/);
  assert.match(html, /disabled/);
});

test("twButton, twButtonRow, twProgress, twCard, twBanner, twDivider, twHeader", () => {
  const row = twButtonRow([
    twButton({ label: "Delete", variant: "danger", size: "sm", block: true }),
    twButton({ label: "Docs", variant: "outline", link: "https://core.telegram.org" })
  ]);
  assert.match(row, /tw-btn-danger/);
  assert.match(row, /tw-btn-sm/);
  assert.match(row, /tw-btn-block/);
  assert.match(row, /data-tw-link="https:\/\/core\.telegram\.org"/);

  const prog = twProgress({ value: 50, max: 200, label: "Upload" });
  assert.match(prog, /role="progressbar"/);
  assert.match(prog, /width:25\.0%/);

  assert.match(twHeader({ title: "Hi", subtitle: "Sub" }), /<h2 class="tw-title">Hi<\/h2>/);
  assert.match(twCard({ title: "Card", content: "<p>Body</p>" }), /tw-card/);
  assert.match(twBanner({ text: "Notice" }), /role="status"/);
  assert.equal(twDivider(), '<hr class="tw-divider">');
});

test("twPagedList, twPagination, and twEmpty render numbered pagination 1..10", () => {
  const empty = twPagedList({ label: "Results", items: [], emptyText: "No items" });
  assert.match(empty, /tw-empty/);
  assert.match(empty, /No items/);

  assert.deepEqual(pageRange(1, 10), [1, 2, "...", 10]);
  assert.deepEqual(pageRange(5, 10), [1, "...", 4, 5, 6, "...", 10]);

  const items = Array.from({ length: 20 }, (_, i) => twListItem({ title: `Item ${i + 1}` }));
  const paged = twPagedList({ label: "Items", items, pageSize: 2, page: 1 });
  assert.match(paged, /data-tw-paged/);
  assert.match(paged, /data-tw-page-btn="1"/);
  assert.match(paged, /data-tw-page-btn="10"/);
  assert.match(paged, /tw-pg-dots/);
  assert.match(paged, /data-tw-prev disabled/);

  const serverPager = twPagination({ page: 2, totalPages: 10, action: "load_page" });
  assert.match(serverPager, /aria-current="page"/);
  assert.match(serverPager, /data-tw-req=/);
  assert.match(twEmpty({ title: "Empty" }), /tw-empty/);
});

test("twMasterDetail and twDetailView render item detail screen with Back button", () => {
  const html = twMasterDetail({
    master: twList({
      items: [twListItem({ title: "Order #1", openDetail: "order-1" })]
    }),
    details: [
      twDetailView({ id: "order-1", title: "Order #1", backLabel: "Back", content: "<p>Paid</p>" })
    ]
  });
  assert.match(html, /data-tw-md/);
  assert.match(html, /data-tw-master/);
  assert.match(html, /data-tw-open="order-1"/);
  assert.match(html, /data-tw-view="order-1" hidden/);
  assert.match(html, /data-tw-back/);
});
