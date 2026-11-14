/* tg-widget-ui runtime: QuickJS-safe, zero-dependency, event-delegated */
(function (root) {
  var tg = root.TelegramWidget || null;
  var listeners = {};
  var dirty = false;

  function emit(name, detail) {
    var list = listeners[name];
    if (list) {
      for (var i = 0; i < list.length; i++) list[i](detail);
    }
  }

  function applyTheme(params) {
    if (!params || !root.document || !root.document.documentElement) return;
    var s = root.document.documentElement.style;
    var map = {
      bg_color: "--tg-theme-bg-color",
      secondary_bg_color: "--tg-theme-secondary-bg-color",
      text_color: "--tg-theme-text-color",
      hint_color: "--tg-theme-hint-color",
      link_color: "--tg-theme-link-color",
      button_color: "--tg-theme-button-color",
      button_text_color: "--tg-theme-button-text-color",
      destructive_text_color: "--tg-theme-destructive-text-color"
    };
    for (var k in map) {
      if (params[k]) s.setProperty(map[k], params[k]);
    }
  }

  function getState(scope) {
    var doc = scope || root.document;
    var state = {};
    var els = doc.querySelectorAll("[data-tw-name]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var name = el.getAttribute("data-tw-name");
      var role = el.getAttribute("role");
      if (role === "checkbox" || role === "switch") {
        state[name] = el.getAttribute("aria-checked") === "true";
      } else if (role === "radiogroup") {
        var checked = el.querySelector('[role="radio"][aria-checked="true"]');
        state[name] = checked ? checked.getAttribute("data-tw-value") : null;
      }
    }
    return state;
  }

  function setDirty(flag) {
    dirty = !!flag;
    var doc = root.document;
    if (!doc) return;
    var btns = doc.querySelectorAll("[data-tw-save]");
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      btn.classList.remove("tw-btn-saved", "tw-btn-danger");
      var idleLabel = btn.getAttribute("data-tw-label") || "Save";
      btn.textContent = idleLabel;
      if (btn.hasAttribute("data-tw-auto-disable")) {
        btn.disabled = !dirty;
      }
    }
    emit("dirty", dirty);
  }

  function sendRequest(payload) {
    var data = typeof payload === "string" ? payload : JSON.stringify(payload);
    if (tg && typeof tg.request === "function") {
      try {
        return Promise.resolve(tg.request(data)).then(function (res) {
          if (res && res.ok === false) return Promise.reject(res);
          return res;
        });
      } catch (err) {
        return Promise.reject(err);
      }
    }
    emit("request", payload);
    return Promise.resolve({ ok: true, local: true, payload: payload });
  }

  function handleSave(btn) {
    var action = btn.getAttribute("data-tw-save") || "save";
    var savingLabel = btn.getAttribute("data-tw-saving") || "Saving...";
    var savedLabel = btn.getAttribute("data-tw-saved") || "Saved";
    var errLabel = btn.getAttribute("data-tw-error") || "Error";
    var state = getState();
    btn.disabled = true;
    btn.classList.remove("tw-btn-saved", "tw-btn-danger");
    btn.textContent = savingLabel;
    return sendRequest({ action: action, state: state }).then(
      function (res) {
        dirty = false;
        btn.disabled = false;
        btn.classList.add("tw-btn-saved");
        btn.textContent = savedLabel;
        emit("save", { action: action, state: state, result: res });
      },
      function (err) {
        btn.disabled = false;
        btn.classList.add("tw-btn-danger");
        btn.textContent = errLabel;
        emit("error", err);
      }
    );
  }

  /* @section paged */function buildNums(p, total) {
    var arr = [];
    if (total <= 6) {
      for (var i = 1; i <= total; i++) arr.push(i);
    } else {
      arr.push(1);
      var l = Math.max(2, p - 1), r = Math.min(total - 1, p + 1);
      if (l > 2) arr.push("...");
      for (var j = l; j <= r; j++) arr.push(j);
      if (r < total - 1) arr.push("...");
      arr.push(total);
    }
    var out = "";
    for (var k = 0; k < arr.length; k++) {
      var n = arr[k];
      out += n === "..."
        ? '<span class="tw-pg-dots">...</span>'
        : '<button type="button" class="tw-pg-num' + (n === p ? " tw-pg-act" : "") + '" data-tw-page-btn="' + n + '"' + (n === p ? ' aria-current="page"' : "") + ">" + n + "</button>";
    }
    return out;
  }

  function updatePaged(wrap, page) {
    var size = parseInt(wrap.getAttribute("data-tw-size") || "5", 10);
    var list = wrap.querySelector(".tw-list");
    if (!list) return;
    var items = list.children;
    var total = Math.max(1, Math.ceil(items.length / size));
    var p = Math.max(1, Math.min(total, page));
    wrap.setAttribute("data-tw-page", String(p));
    var start = (p - 1) * size;
    var end = start + size;
    for (var i = 0; i < items.length; i++) {
      items[i].hidden = i < start || i >= end;
    }
    var nums = wrap.querySelector(".tw-pager-nums");
    if (nums) nums.innerHTML = buildNums(p, total);
    var prev = wrap.querySelector("[data-tw-prev]");
    var next = wrap.querySelector("[data-tw-next]");
    if (prev) prev.disabled = p <= 1;
    if (next) next.disabled = p >= total;
  }/* @section end */

  function onClick(e) {
    var t = e.target;
    while (t && t !== root.document) {
      if (t.getAttribute && t.getAttribute("aria-disabled") === "true") return;
      /* @section paged */if (t.hasAttribute && (t.hasAttribute("data-tw-prev") || t.hasAttribute("data-tw-next") || t.hasAttribute("data-tw-page-btn"))) {
        var wrap = t.parentElement;
        while (wrap && (!wrap.hasAttribute || !wrap.hasAttribute("data-tw-paged"))) {
          wrap = wrap.parentElement;
        }
        if (wrap) {
          var targetPage = t.hasAttribute("data-tw-page-btn")
            ? parseInt(t.getAttribute("data-tw-page-btn"), 10)
            : parseInt(wrap.getAttribute("data-tw-page") || "1", 10) + (t.hasAttribute("data-tw-next") ? 1 : -1);
          updatePaged(wrap, targetPage);
          return;
        }
      }/* @section end */
      /* @section detail */if (t.hasAttribute && t.hasAttribute("data-tw-open")) {
        var id = t.getAttribute("data-tw-open");
        var md = t.parentElement;
        while (md && (!md.hasAttribute || !md.hasAttribute("data-tw-md"))) md = md.parentElement;
        if (md) {
          var m = md.querySelector("[data-tw-master]");
          var v = md.querySelector('[data-tw-view="' + id + '"]');
          if (m && v) { m.hidden = true; v.hidden = false; }
        }
        return;
      }
      if (t.hasAttribute && t.hasAttribute("data-tw-back")) {
        var md2 = t.parentElement;
        while (md2 && (!md2.hasAttribute || !md2.hasAttribute("data-tw-md"))) md2 = md2.parentElement;
        if (md2) {
          var views = md2.querySelectorAll("[data-tw-view]");
          for (var vi = 0; vi < views.length; vi++) views[vi].hidden = true;
          var m2 = md2.querySelector("[data-tw-master]");
          if (m2) m2.hidden = false;
        }
        return;
      }/* @section end */
      var role = t.getAttribute ? t.getAttribute("role") : null;
      if (role === "checkbox" || role === "switch") {
        var next = t.getAttribute("aria-checked") !== "true";
        t.setAttribute("aria-checked", next ? "true" : "false");
        setDirty(true);
        emit("change", { name: t.getAttribute("data-tw-name"), value: next, el: t });
        return;
      }
      if (role === "radio") {
        var group = t.parentElement;
        while (group && group.getAttribute && group.getAttribute("role") !== "radiogroup") {
          group = group.parentElement;
        }
        if (group) {
          var radios = group.querySelectorAll('[role="radio"]');
          for (var i = 0; i < radios.length; i++) {
            radios[i].setAttribute("aria-checked", radios[i] === t ? "true" : "false");
          }
          setDirty(true);
          emit("change", {
            name: group.getAttribute("data-tw-name"),
            value: t.getAttribute("data-tw-value"),
            el: t
          });
        }
        return;
      }
      if (t.hasAttribute && t.hasAttribute("data-tw-save")) {
        handleSave(t);
        return;
      }
      if (t.hasAttribute && t.hasAttribute("data-tw-req")) {
        sendRequest(t.getAttribute("data-tw-req")).catch(function (err) {
          emit("error", err);
        });
        return;
      }
      if (t.hasAttribute && t.hasAttribute("data-tw-link")) {
        var url = t.getAttribute("data-tw-link");
        if (tg && typeof tg.openLink === "function") tg.openLink(url);
        else emit("link", url);
        return;
      }
      if (t.hasAttribute && t.hasAttribute("data-tw-tg-link")) {
        var tgUrl = t.getAttribute("data-tw-tg-link");
        if (tg && typeof tg.openTelegramLink === "function") tg.openTelegramLink(tgUrl);
        else emit("tgLink", tgUrl);
        return;
      }
      t = t.parentElement;
    }
  }

  function init() {
    if (root.document) {
      root.document.addEventListener("click", onClick);
      /* @section paged */var paged = root.document.querySelectorAll("[data-tw-paged]");
      for (var i = 0; i < paged.length; i++) {
        updatePaged(paged[i], parseInt(paged[i].getAttribute("data-tw-page") || "1", 10));
      }/* @section end */
    }
    if (tg) {
      if (tg.themeParams) applyTheme(tg.themeParams);
      if (typeof tg.onEvent === "function") {
        tg.onEvent("themeChanged", function () { applyTheme(tg.themeParams); });
        tg.onEvent("chatDataChanged", function (d) { emit("chatData", d); });
        tg.onEvent("publicDataChanged", function (d) { emit("publicData", d); });
      }
    }
  }

  root.TwUI = {
    init: init,
    getState: getState,
    setDirty: setDirty,
    request: sendRequest,
    applyTheme: applyTheme,
    on: function (name, fn) {
      (listeners[name] = listeners[name] || []).push(fn);
    }
  };

  if (root.document) init();
})(typeof globalThis !== "undefined" ? globalThis : this);
