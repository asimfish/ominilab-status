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

  /* ---------- theme ---------- */
  var themes = ["auto", "light", "dark"];
  function applyTheme(t) {
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
    else document.documentElement.removeAttribute("data-theme");
    $("#themeBtn").textContent = "Theme: " + t;
  }
  var theme = store.get("theme") || "auto";
  applyTheme(theme);
  $("#themeBtn").addEventListener("click", function () {
    theme = themes[(themes.indexOf(theme) + 1) % themes.length];
    store.set("theme", theme);
    applyTheme(theme);
  });

  if (!S) {
    $("#updated").textContent = "Status data failed to load.";
    return;
  }
  $("#updated").textContent = "Updated " + S.updated + " (" + S.tz + ")";

  /* ---------- small components ---------- */
  var STATUS = {
    pass: ["✓", "Pass"], partial: ["!", "Partial"], blocked: ["■", "Blocked"], fail: ["✕", "Fail"],
    pending: ["○", "Not run"], running: ["▶", "Running"], waiting: ["‖", "Waiting"]
  };
  function pill(status, label) {
    var s = STATUS[status] || STATUS.pending;
    return '<span class="pill ' + esc(status) + '"><span class="dot" aria-hidden="true">' + s[0] + "</span>" + esc(label || s[1]) + "</span>";
  }
  function tile(k) {
    var hasOf = typeof k.of === "number";
    var pct = hasOf && k.of > 0 ? Math.max(0, Math.min(100, (Number(k.value) / k.of) * 100)) : 0;
    return '<div class="card">' +
      '<div class="tile-label">' + esc(k.label) + "</div>" +
      '<div class="tile-value">' + esc(k.value) + (hasOf ? ' <span class="of">/ ' + esc(k.of) + "</span>" : "") + "</div>" +
      (hasOf ? '<div class="meter' + (pct === 0 ? " zero" : "") + '" role="img" aria-label="' + esc(k.value + " of " + k.of) + '"><span style="width:' + pct.toFixed(1) + '%"></span></div>' : "") +
      (k.status ? '<div style="margin-top:8px">' + pill(k.status) + "</div>" : "") +
      (k.note ? '<div class="tile-note">' + esc(k.note) + "</div>" : "") +
      "</div>";
  }
  function kpis(list) { return '<div class="grid kpis">' + list.map(tile).join("") + "</div>"; }
  function bullets(list) { return '<ul class="clean">' + list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
  function statusList(list) {
    return '<div class="card list-status">' + list.map(function (c) {
      return '<div class="row"><div><div class="n">' + esc(c.name) + '</div><div class="d">' + esc(c.detail) + "</div></div>" + pill(c.status) + "</div>";
    }).join("") + "</div>";
  }
  function brk(s) { return esc(s).replace(/_/g, "_<wbr>"); }
  function header(sys) { return "<h1>" + esc(sys.title) + '</h1><p class="sub">' + esc(sys.subtitle) + "</p>"; }

  /* ---------- tooltip ---------- */
  var tip = document.createElement("div");
  tip.className = "tip"; tip.setAttribute("role", "tooltip");
  document.body.appendChild(tip);
  function bindTips(root) {
    root.querySelectorAll("[data-tip]").forEach(function (el) {
      var show = function (e) {
        tip.textContent = el.getAttribute("data-tip");
        tip.style.display = "block";
        var r = el.getBoundingClientRect();
        var x = e && e.clientX ? e.clientX : r.left + r.width / 2;
        var y = e && e.clientY ? e.clientY : r.top;
        tip.style.left = Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, x - tip.offsetWidth / 2)) + "px";
        tip.style.top = Math.max(8, y - tip.offsetHeight - 12) + "px";
      };
      var hide = function () { tip.style.display = "none"; };
      el.addEventListener("mousemove", show);
      el.addEventListener("mouseleave", hide);
      el.addEventListener("focus", show);
      el.addEventListener("blur", hide);
    });
  }

  /* ---------- overview ---------- */
  function renderOverview() {
    var h = '<div class="headline">' + esc(S.headline) + "</div>";
    h += '<h2 style="margin-top:0">The four systems</h2><div class="pipeline">';
    S.pipeline.forEach(function (p) {
      h += '<div class="card link stage" tabindex="0" data-go="' + esc(p.sys) + '">' +
        '<div class="num">SYSTEM ' + esc(p.num) + "</div>" +
        '<div class="t">' + esc(p.title) + "</div>" + pill(p.state) +
        '<div class="m">' + esc(p.metric) + "</div></div>";
    });
    h += "</div><h2>Agents right now</h2><div class=\"grid cards2\">";
    S.agents.forEach(function (a) {
      h += '<div class="card agent-row"><div style="flex:1;min-width:0"><div class="who">' + esc(a.name) + '</div><div class="doing">' + esc(a.doing) + "</div></div>" + pill(a.state) + "</div>";
    });
    h += "</div><h2>Latest milestones</h2>" + timelineHtml(S.timeline.slice(-5).reverse());
    $("#tab-overview").innerHTML = h;
    $("#tab-overview").querySelectorAll("[data-go]").forEach(function (el) {
      var go = function () { selectTab(el.getAttribute("data-go")); };
      el.addEventListener("click", go);
      el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
  }

  /* ---------- 1 scenes ---------- */
  function renderScenes() {
    var s = S.systems.scenes;
    var h = header(s) + kpis(s.kpis);
    h += '<h2>Scenes</h2><div class="table-wrap"><table class="stack"><thead><tr><th>Scene</th><th>Group</th><th class="num">Objects</th><th>Status</th><th>Latest finding</th></tr></thead><tbody>';
    s.rooms.forEach(function (r) {
      h += '<tr><td class="name" data-label="Scene">' + brk(r.name) + '</td><td class="muted" data-label="Group">' + (r.group === "base" ? "Base" : "New") + '</td><td class="num" data-label="Objects">' + esc(r.objects) + '</td><td data-label="Status">' + pill(r.status) + '</td><td class="small" data-label="Finding">' + esc(r.finding) + "</td></tr>";
    });
    h += "</tbody></table></div>";
    h += "<h2>Isolated fixtures and components</h2>" + statusList(s.components);
    h += '<h2>In progress</h2><div class="card">' + bullets(s.now) + "</div>";
    h += '<h2>How inspection works</h2><div class="card">' + bullets(s.method) + "</div>";
    $("#tab-scenes").innerHTML = h;
  }

  /* ---------- 2 auto scenes ---------- */
  function renderAuto() {
    var s = S.systems.autoscene;
    var h = header(s) + kpis(s.kpis);
    h += "<h2>Components</h2>" + statusList(s.components);
    h += '<h2>Paper-driven scene proposals</h2><div class="card"><div class="legend" style="gap:8px">' +
      s.proposals.map(function (p) { return '<span class="pill pending"><span class="dot" aria-hidden="true">○</span>' + esc(p) + "</span>"; }).join("") +
      '</div><p class="tile-note">Generated layouts; none verified in the real simulator yet.</p></div>';
    h += '<h2>In progress</h2><div class="card">' + bullets(s.now) + "</div>";
    $("#tab-autoscene").innerHTML = h;
  }

  /* ---------- 3 paper -> plan ---------- */
  function renderPaper() {
    var s = S.systems.paper;
    var h = header(s) + kpis(s.kpis);
    var total = s.routes.reduce(function (a, r) { return a + r.value; }, 0);
    var colors = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];
    var ink = ["#fff", "#fff", "#fff", "#2b1d00"];
    h += '<h2>Compiled skill calls by route <span class="tag">' + esc(s.routes_asof) + "</span></h2>";
    h += '<div class="card"><div class="tile-value">' + total.toLocaleString("en-US") + ' <span class="of">calls</span></div>';
    h += '<div class="seg" role="img" aria-label="' + esc(s.routes.map(function (r) { return r.name + " " + r.value; }).join(", ")) + '">';
    s.routes.forEach(function (r, i) {
      var share = (100 * r.value / total);
      h += '<div tabindex="0" data-tip="' + esc(r.name + ": " + r.value.toLocaleString("en-US") + " (" + share.toFixed(1) + "%)") + '" style="flex:' + r.value + ";background:" + colors[i] + ";color:" + ink[i] + '">' + (share >= 9 ? share.toFixed(0) + "%" : "") + "</div>";
    });
    h += '</div><div class="legend">' + s.routes.map(function (r, i) { return '<span><i style="background:' + colors[i] + '"></i>' + esc(r.name) + "</span>"; }).join("") + "</div>";
    h += '<details style="margin-top:8px"><summary class="small muted">Table view</summary><table><thead><tr><th>Route</th><th class="num">Calls</th><th class="num">Share</th></tr></thead><tbody>' +
      s.routes.map(function (r) { return "<tr><td>" + esc(r.name) + '</td><td class="num">' + r.value.toLocaleString("en-US") + '</td><td class="num">' + (100 * r.value / total).toFixed(1) + "%</td></tr>"; }).join("") +
      "</tbody></table></details></div>";
    h += '<h2>Compiled experiments</h2><div class="table-wrap"><table class="stack"><thead><tr><th>Experiment</th><th class="num">Success criteria</th><th class="num">Tolerance from source</th><th>Admitted to run</th><th>Executed</th></tr></thead><tbody>';
    s.experiments.forEach(function (e) {
      h += '<tr><td class="name" data-label="Experiment">' + brk(e.name) + '</td><td class="num" data-label="Criteria">' + esc(e.criteria) + '</td><td class="num" data-label="From source">0</td><td data-label="Admitted">' + pill("pending", "No") + '</td><td data-label="Executed">' + pill("pending", "No") + "</td></tr>";
    });
    h += "</tbody></table></div>";
    h += "<h2>Components</h2>" + statusList(s.components);
    h += '<h2>In progress</h2><div class="card">' + bullets(s.now) + "</div>";
    $("#tab-paper").innerHTML = h;
    bindTips($("#tab-paper"));
  }

  /* ---------- 4 execution ---------- */
  function renderExec() {
    var s = S.systems.exec;
    var h = header(s) + kpis(s.kpis);
    h += "<h2>Capabilities in the real simulator</h2>" + statusList(s.capabilities);
    h += '<h2>Skill library <span class="tag">20 skills · 0 approved</span></h2><div class="skills">';
    s.skills.forEach(function (g) {
      h += '<div class="card"><div class="tile-label" style="margin-bottom:4px">' + esc(g.group) + "</div>" +
        g.items.map(function (it) { return '<div class="item"><code>' + brk(it.id) + "</code>" + pill(it.status, it.label) + "</div>"; }).join("") + "</div>";
    });
    h += '</div><h2>Path to the first complete experiment (balance routine check)</h2><div class="card roadmap">';
    s.roadmap.forEach(function (r) {
      h += '<div class="r"><div><div>' + esc(r.step) + '</div><div class="owner">' + esc(r.owner) + "</div></div>" + pill(r.status) + "</div>";
    });
    h += "</div>";
    $("#tab-exec").innerHTML = h;
  }

  /* ---------- debug ---------- */
  function renderDebug() {
    var d = S.debug;
    var port = store.get("dbgPort") || String(d.default_port);
    var gpu = store.get("dbgGpu") || "0";
    var h = "<h1>Debug window</h1><p class=\"sub\">Live native Isaac Sim GUI for the base scenes. The stream is reachable only through your own SSH tunnel; this public page never exposes a control port.</p>";
    h += '<div class="card agent-row"><div style="flex:1"><div class="who">Debug window status</div><div class="doing">' + esc(d.note) + "</div></div>" + pill(d.running ? "running" : "pending", d.running ? "Running" : "Not running") + "</div>";
    h += '<h2>Connect</h2><div class="card"><ol class="clean" style="padding-left:20px">' +
      "<li>Ask the operator to open a debug window (it runs as a separate cloud GPU job).</li>" +
      "<li>On your computer, open the SSH tunnel from the private runbook. It forwards the stream to <code>127.0.0.1</code> on the port below.</li>" +
      "<li>Pick a GPU lane and press Connect. GPU 0 is the interactive GUI; GPUs 1–3 show diagnostic runs.</li></ol>" +
      '<div class="debug-controls"><label>Local port<input id="dbgPort" inputmode="numeric" value="' + esc(port) + '"></label>' +
      '<label>GPU lane<select id="dbgGpu">' + d.gpus.map(function (g) { return '<option value="' + g + '"' + (String(g) === gpu ? " selected" : "") + ">GPU " + g + "</option>"; }).join("") + "</select></label>" +
      '<button class="btn" id="dbgConnect" type="button">Connect</button>' +
      '<button class="btn secondary" id="dbgOpen" type="button">Open in new tab</button>' +
      '<button class="btn secondary" id="dbgStop" type="button">Disconnect</button></div>' +
      '<p class="tile-note">If the panel stays blank: check the tunnel is open, allow the browser\'s local-network prompt, or use "Open in new tab" (Safari blocks local content inside https pages).</p></div>';
    h += '<div class="viewer" id="viewer" style="margin-top:12px">Not connected</div>';
    $("#tab-debug").innerHTML = h;
    var url = function () {
      var p = parseInt($("#dbgPort").value, 10);
      if (!(p > 1023 && p < 65536)) { return null; }
      return "http://127.0.0.1:" + p + "/?gpu=" + encodeURIComponent($("#dbgGpu").value);
    };
    $("#dbgConnect").addEventListener("click", function () {
      var u = url();
      if (!u) { $("#viewer").textContent = "Enter a port between 1024 and 65535."; return; }
      store.set("dbgPort", $("#dbgPort").value); store.set("dbgGpu", $("#dbgGpu").value);
      $("#viewer").innerHTML = '<iframe title="Isaac Sim debug stream" src="' + esc(u) + '" allow="fullscreen; autoplay"></iframe>';
    });
    $("#dbgOpen").addEventListener("click", function () { var u = url(); if (u) window.open(u, "_blank", "noopener"); });
    $("#dbgStop").addEventListener("click", function () { $("#viewer").textContent = "Not connected"; });
  }

  /* ---------- timeline ---------- */
  var SYS = { scenes: "1 · Base scenes", autoscene: "2 · Auto scenes", paper: "3 · Paper → plan", exec: "4 · Execution" };
  function timelineHtml(list) {
    return '<div class="card tl">' + list.map(function (e) {
      return '<div class="e"><div class="when">' + esc(e.t) + '</div><div class="bar" aria-hidden="true"></div><div class="what">' + esc(e.text) + '<span class="tag">' + esc(SYS[e.sys] || e.sys) + "</span></div></div>";
    }).join("") + "</div>";
  }
  function renderTimeline() {
    $("#tab-timeline").innerHTML = "<h1>Timeline</h1><p class=\"sub\">Milestones, newest first (" + esc(S.tz) + ").</p>" + timelineHtml(S.timeline.slice().reverse());
  }

  /* ---------- tabs ---------- */
  var tabs = ["overview", "scenes", "autoscene", "paper", "exec", "debug", "timeline"];
  function selectTab(name) {
    if (tabs.indexOf(name) < 0) name = "overview";
    tabs.forEach(function (t) {
      $("#tab-" + t).hidden = t !== name;
      var b = $('#tabs [data-tab="' + t + '"]');
      b.setAttribute("aria-selected", t === name ? "true" : "false");
      b.tabIndex = t === name ? 0 : -1;
    });
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
    window.scrollTo(0, 0);
  }
  $("#tabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]");
    if (b) selectTab(b.getAttribute("data-tab"));
  });
  $("#tabs").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var cur = tabs.indexOf((location.hash || "#overview").slice(1));
    var next = tabs[(cur + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    $('#tabs [data-tab="' + next + '"]').focus();
  });
  window.addEventListener("hashchange", function () { selectTab(location.hash.slice(1)); });

  renderOverview(); renderScenes(); renderAuto(); renderPaper(); renderExec(); renderDebug(); renderTimeline();
  selectTab((location.hash || "#overview").slice(1));
})();
