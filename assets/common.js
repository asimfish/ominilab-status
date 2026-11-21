/* Shared helpers for index.html and agents.html: escaping, theme, status pills, metrics and stage cards. */
(function () {
  "use strict";
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  function initTheme(btn) {
    var themes = ["auto", "light", "dark"];
    var theme = store.get("theme") || "auto";
    function apply(t) {
      if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
      else document.documentElement.removeAttribute("data-theme");
      if (btn) {
        btn.textContent = t === "auto" ? "◐ Auto" : (t === "light" ? "☀ Light" : "☾ Dark");
        btn.setAttribute("aria-label", "Colour theme: " + t + " (click to change)");
      }
    }
    apply(theme);
    if (btn) btn.addEventListener("click", function () {
      theme = themes[(themes.indexOf(theme) + 1) % themes.length];
      store.set("theme", theme); apply(theme);
      window.dispatchEvent(new Event("themechange"));
    });
  }

  var LABEL = { pass: "Pass", partial: "Partial", blocked: "Blocked", fail: "Fail", pending: "Not run",
                running: "Running", online: "Live", offline: "Offline" };
  function pill(status, label) {
    var s = LABEL[status] ? status : "pending";
    return '<span class="pill ' + s + '"><span class="dot" aria-hidden="true"></span>' + esc(label || LABEL[s]) + "</span>";
  }
  var AGENT = { running: "running", idle: "idle", stalled: "not running" };
  function agent(name, state) {
    if (!name) return "";
    var st = AGENT[state] ? state : "idle";
    return '<span class="agent ' + st + '"><span class="dot" aria-hidden="true"></span>' + esc(name) + " · " + AGENT[st] + "</span>";
  }

  function isNum(v) { return typeof v === "number" && isFinite(v); }
  function fmt(v) { return isNum(v) ? v.toLocaleString("en-US") : esc(v); }
  function ratio(mt) { return isNum(mt.value) && isNum(mt.total) && mt.total > 0 ? Math.max(0, Math.min(1, mt.value / mt.total)) : null; }
  function bar(r) { return '<div class="bar' + (r === 0 ? " zero" : "") + '"><i style="width:' + (r * 100).toFixed(1) + '%"></i></div>'; }
  function valueHtml(mt) {
    return fmt(mt.value) + (mt.total != null ? "<small> / " + fmt(mt.total) + "</small>" : "") + (mt.unit ? "<small> " + esc(mt.unit) + "</small>" : "");
  }
  function kpi(mt) {
    if (!mt) return "";
    var r = ratio(mt);
    return '<div class="kpi"><div class="kpi-top"><span class="kpi-val">' + valueHtml(mt) + '</span><span class="kpi-label">' + esc(mt.label) + "</span></div>" + (r != null ? bar(r) : "") + "</div>";
  }
  function metricRows(list, withBars) {
    if (!list || !list.length) return "";
    return '<ul class="mlist">' + list.map(function (mt) {
      var r = ratio(mt);
      return '<li class="mrow"><span class="ml">' + esc(mt.label) + '</span><span class="mv">' + fmt(mt.value) + (mt.total != null ? " / " + fmt(mt.total) : "") + (mt.unit ? " " + esc(mt.unit) : "") + "</span>" +
        (withBars && r != null ? bar(r) : "") + "</li>";
    }).join("") + "</ul>";
  }
  function tiles(list) {
    if (!list || !list.length) return "";
    return '<div class="tiles">' + list.map(function (mt) {
      var r = ratio(mt);
      return '<div class="tile"><div class="tl">' + esc(mt.label) + '</div><div class="tv">' + valueHtml(mt) + "</div>" + (r != null ? bar(r) : "") + "</div>";
    }).join("") + "</div>";
  }


  /* milestone track: done / now / todo, drawn as a line of stations */
  var MSTATE = { done: "Done", now: "In progress", todo: "Not started" };
  function track(list, cls) {
    if (!list || !list.length) return "";
    return '<ol class="track' + (cls ? " " + cls : "") + '">' + list.map(function (m) {
      var s = MSTATE[m.s] ? m.s : "todo";
      return '<li class="mst ' + s + '"><span class="d" aria-hidden="true">' + (s === "done" ? "✓" : "") + "</span>" +
        '<span class="sr">' + MSTATE[s] + ": </span>" +
        '<span class="mt">' + esc(m.t) + "</span>" + (m.n ? '<span class="mn">' + esc(m.n) + "</span>" : "") + "</li>";
    }).join("") + "</ol>";
  }
  function segs(list) {
    return '<div class="segs" aria-hidden="true">' + (list || []).map(function (m) { return '<i class="' + esc(m.s) + '"></i>'; }).join("") + "</div>";
  }
  function count(list) {
    var c = { done: 0, now: 0, todo: 0, total: (list || []).length };
    (list || []).forEach(function (m) { c[MSTATE[m.s] ? m.s : "todo"]++; });
    return c;
  }

  function stageLink(st) { if (st.href) return st.href; return "index.html#" + encodeURIComponent(st.group) + (st.item ? "/" + encodeURIComponent(st.item) : ""); }
  function stageBody(st) {
    return '<div class="stage-head"><div class="stage-title">' + esc(st.title) + "</div>" + pill(st.status) + "</div>" +
      '<div class="stage-what">' + esc(st.what) + "</div>" +
      agent(st.agent, st.agent_state) +
      track(st.milestones, "small") +
      kpi(st.progress) +
      metricRows(st.metrics, true) +
      (st.next ? '<div class="next"><b>Next:</b> ' + esc(st.next) + "</div>" : "");
  }
  function stageCard(st, href) {
    return '<article class="stage ' + esc(st.step) + '">' + stageBody(st) +
      (href ? '<div class="stage-foot"><span></span><a class="more" href="' + esc(href) + '">Open details →</a></div>' : "") + "</article>";
  }

  window.OL = { esc: esc, store: store, initTheme: initTheme, pill: pill, agent: agent, kpi: kpi, metricRows: metricRows,
                tiles: tiles, track: track, segs: segs, count: count, stageBody: stageBody, stageCard: stageCard, stageLink: stageLink, isNum: isNum };
})();
