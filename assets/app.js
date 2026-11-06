(function () {
  "use strict";
  var S = window.STATUS;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* theme */
  var themes = ["auto", "light", "dark"];
  var theme = store.get("theme") || "auto";
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    $("#themeBtn").textContent = t === "auto" ? "◐" : (t === "light" ? "☀" : "☾");
    $("#themeBtn").setAttribute("aria-label", "Colour theme: " + t);
  }
  applyTheme(theme);
  $("#themeBtn").addEventListener("click", function () {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length];
    store.set("theme", theme); applyTheme(theme);
  });

  if (!S) { $("#updated").textContent = "Status data failed to load."; return; }
  $("#updated").textContent = "Updated " + S.updated + " (" + S.tz + ")";

  var STATUS = {
    pass: ["✓", "Pass"], partial: ["!", "Partial"], blocked: ["■", "Blocked"], fail: ["✕", "Fail"],
    pending: ["○", "Not run"], running: ["▶", "Running"], online: ["●", "Live"], offline: ["○", "Offline"]
  };
  function pill(status, label) {
    var s = STATUS[status] || STATUS.pending;
    return '<span class="pill ' + esc(status) + '"><span class="dot" aria-hidden="true">' + s[0] + "</span>" + esc(label || s[1]) + "</span>";
  }

  /* session + connection */
  var port = store.get("dbgPort") || String(S.default_port);
  var sess = S.session || { online: false };
  $("#session").innerHTML = pill(sess.online ? "online" : "offline", sess.online ? "Debug session live" + (sess.expires ? " · until " + sess.expires : "") : "Debug session offline");
  $("#portInput").value = port;
  $("#portInput").addEventListener("change", function () {
    var p = parseInt(this.value, 10);
    if (p > 1023 && p < 65536) { port = String(p); store.set("dbgPort", port); if (current) show(current.group, current.item); }
    else this.value = port;
  });

  /* tabs */
  var tabs = S.groups.map(function (g) { return g.id; }).concat(["summary"]);
  var current = null;
  var nav = $("#tabs");
  nav.innerHTML = S.groups.map(function (g) {
    return '<button role="tab" data-tab="' + esc(g.id) + '">' + esc(g.title) + "</button>";
  }).join("") + '<button role="tab" data-tab="summary">Summary</button>';

  function viewerUrl(item) {
    return "http://127.0.0.1:" + port + "/?gpu=0&scene=" + encodeURIComponent(item.scene || item.id);
  }

  function show(group, item) {
    current = { group: group, item: item };
    document.querySelectorAll(".scene-btn").forEach(function (b) {
      b.setAttribute("aria-current", b.getAttribute("data-id") === item.id ? "true" : "false");
    });
    var v = $("#viewer");
    var head = '<div class="vhead"><div><div class="vtitle">' + esc(item.title) + '</div><div class="vline">' + pill(item.status) + " " + esc(item.line) + "</div></div>";
    var actions = "";
    if (item.live && sess.online) {
      actions = '<div class="vact"><button class="btn" id="connectBtn" type="button">Open live</button>' +
        '<a class="btn secondary" target="_blank" rel="noopener" href="' + esc(viewerUrl(item)) + '">New tab</a></div>';
    }
    head += actions + "</div>";
    var body;
    if (item.live && sess.online && store.get("autoConnect") === "1") {
      body = '<iframe title="Live Isaac Sim view" src="' + esc(viewerUrl(item)) + '" allow="fullscreen; autoplay"></iframe>';
    } else {
      var msg;
      if (!item.live) msg = "This scene joins the live viewer soon.";
      else if (!sess.online) msg = "Opens live here when a debug session is running.";
      else msg = "Open your SSH tunnel, then press “Open live”.";
      body = '<div class="placeholder">' + (item.img ? '<img alt="" src="' + esc(item.img) + '">' : '<div class="ph-icon" aria-hidden="true">⬚</div>') +
        '<div class="ph-msg">' + esc(msg) + "</div></div>";
    }
    v.innerHTML = head + '<div class="stage">' + body + "</div>" +
      (item.details ? '<details class="vdetails"><summary>Details</summary><p>' + esc(item.details) + "</p></details>" : "");
    var cb = $("#connectBtn");
    if (cb) cb.addEventListener("click", function () {
      store.set("autoConnect", "1");
      $(".stage", v).innerHTML = '<iframe title="Live Isaac Sim view" src="' + esc(viewerUrl(item)) + '" allow="fullscreen; autoplay"></iframe>';
    });
    if (location.hash !== "#" + group.id + "/" + item.id) history.replaceState(null, "", "#" + group.id + "/" + item.id);
  }

  function renderGroup(g, itemId) {
    var list = g.items.map(function (it) {
      return '<button class="scene-btn" type="button" data-id="' + esc(it.id) + '">' +
        '<span class="sname">' + esc(it.title) + "</span>" +
        '<span class="smeta">' + pill(it.status) + '<span class="stag">' + esc(it.tag) + (it.live ? "" : " · soon") + "</span></span></button>";
    }).join("");
    $("#main").innerHTML = '<p class="blurb">' + esc(g.blurb) + '</p><div class="console"><div class="scenes" role="list">' + list +
      '</div><div class="viewer-col" id="viewer"></div></div>';
    document.querySelectorAll(".scene-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = g.items.filter(function (x) { return x.id === b.getAttribute("data-id"); })[0];
        show(g, it);
      });
    });
    var start = g.items.filter(function (x) { return x.id === itemId; })[0] || g.items[0];
    show(g, start);
  }

  function renderSummary() {
    current = null;
    var h = '<div class="summary"><div class="card">' + S.summary.map(function (s) {
      return '<div class="srow"><div><div class="sname">' + esc(s.name) + '</div><div class="vline">' + esc(s.line) + "</div></div>" + pill(s.status) + "</div>";
    }).join("") + '</div><h2>Recent milestones</h2><div class="card">' + S.timeline.map(function (e) {
      return '<div class="trow"><span class="when">' + esc(e.t) + "</span><span>" + esc(e.text) + "</span></div>";
    }).join("") + "</div></div>";
    $("#main").innerHTML = h;
    if (location.hash !== "#summary") history.replaceState(null, "", "#summary");
  }

  function select(hash) {
    var parts = (hash || "").replace(/^#/, "").split("/");
    var tab = tabs.indexOf(parts[0]) >= 0 ? parts[0] : tabs[0];
    nav.querySelectorAll("[data-tab]").forEach(function (b) {
      var on = b.getAttribute("data-tab") === tab;
      b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1;
    });
    if (tab === "summary") renderSummary();
    else renderGroup(S.groups.filter(function (g) { return g.id === tab; })[0], parts[1]);
  }
  nav.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (b) select("#" + b.getAttribute("data-tab"));
  });
  nav.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var cur = nav.querySelector('[aria-selected="true"]').getAttribute("data-tab");
    var next = tabs[(tabs.indexOf(cur) + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    select("#" + next); nav.querySelector('[data-tab="' + next + '"]').focus();
  });
  window.addEventListener("hashchange", function () { select(location.hash); });
  select(location.hash);
})();
