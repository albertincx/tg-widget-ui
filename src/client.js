/* tg-widget-ui client: QuickJS-safe, zero-dependency, event-delegated */
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
      /* @section stepper */} else if (el.hasAttribute("data-tw-stepper")) {
        state[name] = Number(el.getAttribute("data-tw-val") || "0");/* @section end */
      /* @section chips */} else if (el.hasAttribute("data-tw-chips")) {
        var pressed = el.querySelectorAll('[data-tw-chip][aria-pressed="true"]');
        if (el.hasAttribute("data-tw-multi")) {
          var vals = [];
          for (var j = 0; j < pressed.length; j++) vals.push(pressed[j].getAttribute("data-tw-value"));
          state[name] = vals;
        } else {
          state[name] = pressed.length ? pressed[0].getAttribute("data-tw-value") : null;
        }/* @section end */
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

  /* @section overlay */function setLoading(flag, text) {
    var doc = root.document;
    if (!doc) return;
    var ov = doc.querySelector("[data-tw-overlay]");
    if (!ov && flag && doc.createElement) {
      var host = doc.querySelector(".tw-root") || doc.body;
      if (host) {
        ov = doc.createElement("div");
        ov.className = "tw-overlay";
        ov.setAttribute("data-tw-overlay", "");
        ov.setAttribute("role", "status");
        ov.setAttribute("aria-live", "polite");
        ov.setAttribute("aria-busy", "true");
        ov.innerHTML = '<div class="tw-overlay-box"><span class="tw-spinner" aria-hidden="true"></span><span class="tw-overlay-text"></span></div>';
        host.appendChild(ov);
      }
    }
    if (ov) {
      var tx = ov.querySelector(".tw-overlay-text");
      if (tx && text) tx.textContent = text;
      ov.hidden = !flag;
    }
    emit("loading", !!flag);
  }/* @section end */

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

  /* @section save */function handleSave(btn) {
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
  }/* @section end */

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

  function up(el, attr) {
    while (el && (!el.hasAttribute || !el.hasAttribute(attr))) el = el.parentElement;
    return el;
  }

  function onClick(e) {
    var t = e.target;
    while (t && t !== root.document) {
      if (!t.hasAttribute) { t = t.parentElement; continue; }
      if (t.getAttribute("aria-disabled") === "true") return;
      /* @section paged */if (t.hasAttribute("data-tw-prev") || t.hasAttribute("data-tw-next") || t.hasAttribute("data-tw-page-btn")) {
        var wrap = up(t.parentElement, "data-tw-paged");
        if (wrap) {
          var targetPage = t.hasAttribute("data-tw-page-btn")
            ? parseInt(t.getAttribute("data-tw-page-btn"), 10)
            : parseInt(wrap.getAttribute("data-tw-page") || "1", 10) + (t.hasAttribute("data-tw-next") ? 1 : -1);
          if (wrap.hasAttribute("data-tw-lock") && typeof setLoading === "function") {
            var ms = parseInt(wrap.getAttribute("data-tw-lock") || "300", 10) || 300;
            setLoading(true, wrap.getAttribute("data-tw-loading") || "Loading...");
            setTimeout(function () {
              updatePaged(wrap, targetPage);
              setLoading(false);
            }, ms);
          } else {
            updatePaged(wrap, targetPage);
          }
          return;
        }
      }/* @section end */
      /* @section detail */if (t.hasAttribute("data-tw-open")) {
        var id = t.getAttribute("data-tw-open");
        var md = up(t.parentElement, "data-tw-md");
        if (md) {
          var m = md.querySelector("[data-tw-master]");
          var v = md.querySelector('[data-tw-view="' + id + '"]');
          if (m && v) { m.hidden = true; v.hidden = false; }
        }
        return;
      }
      if (t.hasAttribute("data-tw-back")) {
        var md2 = up(t.parentElement, "data-tw-md");
        if (md2) {
          var views = md2.querySelectorAll("[data-tw-view]");
          for (var vi = 0; vi < views.length; vi++) views[vi].hidden = true;
          var m2 = md2.querySelector("[data-tw-master]");
          if (m2) m2.hidden = false;
        }
        return;
      }/* @section end */
      /* @section tabs */if (t.hasAttribute("data-tw-tab")) {
        var tabId = t.getAttribute("data-tw-tab"), tr = up(t.parentElement, "data-tw-tabs");
        if (tr) {
          var ts = tr.querySelectorAll("[data-tw-tab]"), ps = tr.querySelectorAll("[data-tw-panel]"), i;
          for (i = 0; i < ts.length; i++) ts[i].setAttribute("aria-selected", ts[i] === t ? "true" : "false");
          for (i = 0; i < ps.length; i++) ps[i].hidden = ps[i].getAttribute("data-tw-panel") !== tabId;
          emit("tab", { id: tabId, el: t });
        }
        return;
      }/* @section end */
      /* @section accordion */if (t.hasAttribute("data-tw-acc")) {
        var exp = t.getAttribute("aria-expanded") === "true";
        t.setAttribute("aria-expanded", exp ? "false" : "true");
        if (t.nextElementSibling) t.nextElementSibling.hidden = exp;
        emit("accordion", { expanded: !exp, el: t });
        return;
      }/* @section end */
      /* @section stepper */if (t.hasAttribute("data-tw-step")) {
        var st = up(t.parentElement, "data-tw-stepper");
        if (st && st.getAttribute("aria-disabled") !== "true") {
          var cur = +st.getAttribute("data-tw-val"), mn = +st.getAttribute("data-tw-min"), mx = +st.getAttribute("data-tw-max"),
              nv = Math.max(mn, Math.min(mx, cur + (+t.getAttribute("data-tw-step")) * (+st.getAttribute("data-tw-step-by") || 1)));
          if (nv !== cur) {
            st.setAttribute("data-tw-val", String(nv));
            var u = st.getAttribute("data-tw-unit"), ve = st.querySelector(".tw-step-val");
            if (ve) ve.textContent = u ? nv + " " + u : String(nv);
            st.querySelector('[data-tw-step="-1"]').disabled = nv <= mn;
            st.querySelector('[data-tw-step="1"]').disabled = nv >= mx;
            setDirty(true);
            emit("change", { name: st.getAttribute("data-tw-name"), value: nv, el: st });
          }
        }
        return;
      }/* @section end */
      /* @section chips */if (t.hasAttribute("data-tw-chip")) {
        var cg = up(t.parentElement, "data-tw-chips");
        if (cg) {
          if (cg.hasAttribute("data-tw-multi")) {
            t.setAttribute("aria-pressed", t.getAttribute("aria-pressed") === "true" ? "false" : "true");
          } else {
            var ac = cg.querySelectorAll("[data-tw-chip]");
            for (var ci = 0; ci < ac.length; ci++) ac[ci].setAttribute("aria-pressed", ac[ci] === t ? "true" : "false");
          }
          setDirty(true);
          var cn = cg.getAttribute("data-tw-name");
          emit("change", { name: cn, value: getState()[cn], el: cg });
        }
        return;
      }/* @section end */
      var role = t.getAttribute("role");
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
      /* @section save */if (t.hasAttribute("data-tw-save")) {
        var lockSave = t.hasAttribute("data-tw-lock") && typeof setLoading === "function";
        if (lockSave) setLoading(true, t.getAttribute("data-tw-saving") || "Saving...");
        var pSave = handleSave(t);
        if (lockSave && pSave && pSave.then) pSave.then(function () { setLoading(false); }, function () { setLoading(false); });
        return;
      }/* @section end */
      if (t.hasAttribute("data-tw-req")) {
        /* @section overlay */var lockReq = t.hasAttribute("data-tw-lock");
        if (lockReq) setLoading(true, t.getAttribute("data-tw-loading") || "Loading...");/* @section end */
        var pReq = sendRequest(t.getAttribute("data-tw-req")).catch(function (err) {
          emit("error", err);
        });
        /* @section overlay */if (lockReq && pReq && pReq.then) pReq.then(function () { setLoading(false); }, function () { setLoading(false); });/* @section end */
        return;
      }
      /* @section overlay */if (t.hasAttribute("data-tw-lock")) {
        setLoading(true, t.getAttribute("data-tw-loading") || "Loading...");
        emit("lock", { el: t });
        return;
      }/* @section end */
      if (t.hasAttribute("data-tw-link")) {
        var url = t.getAttribute("data-tw-link");
        if (tg && typeof tg.openLink === "function") tg.openLink(url);
        else emit("link", url);
        return;
      }
      if (t.hasAttribute("data-tw-tg-link")) {
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
    /* @section overlay */setLoading: setLoading,/* @section end */
    on: function (name, fn) {
      (listeners[name] = listeners[name] || []).push(fn);
    }
  };

  if (root.document) init();
})(typeof globalThis !== "undefined" ? globalThis : this);
