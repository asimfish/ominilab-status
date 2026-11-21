/* catalog.html — Assets & scenes. Routes: #assets[/<id>], #scenes[/<id>], #experiments[/<id>]. */
(function () {
  "use strict";
  var C = window.CATALOG, S = window.STATUS, OL = window.OL, esc = OL.esc;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  OL.initTheme($("#themeBtn"));
  if (!C) { $("#updated").textContent = "Catalog data failed to load."; return; }
  $("#updated").textContent = "Assets & scenes · data as of " + C.updated + " (UTC+8)";
  $("#sources").textContent = "Sources: " + C.sources.assets + "; " + C.sources.scenes + ".";

  /* top tabs (same as the other pages) */
  var steps = S && S.pipeline ? S.pipeline.steps : [];
  $("#tabs").innerHTML = '<a class="tab" href="agents.html">Plan &amp; progress</a>' + steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" aria-selected="true" href="catalog.html">Assets &amp; scenes</a><a class="tab" href="index.html#summary">Goals &amp; timeline</a>';

  var A = C.assets, SC = C.scenes, EX = C.experiments;
  var byA = {}, byS = {}, byE = {};
  A.forEach(function (a) { byA[a.id] = a; }); SC.forEach(function (s) { byS[s.id] = s; }); EX.forEach(function (e) { byE[e.id] = e; });

  var GNAME = { A: "Fully operable", B: "Fixable", C: "Display only", D: "Not yet operable" };
  var GTIP = { A: "Its main function works in the tested set-up, checked both ways.", B: "Has the parts it needs; a known fix or wiring step remains, then a function test.",
               C: "Only a static model for its intended function.", D: "Missing parts or proof of function that cannot be fixed automatically yet." };
  var LVL = { L0: "Loads, not yet stable", L1: "Stable at rest", L2: "Usable for building scenes", L3: "Moving parts or grasp confirmed", L4: "Performs its experimental function" };
  var REPAIR = { "关节状态元数据补全": "Joint states annotated", "EXISTING_GEOMETRY_OR_SUPPORT_OVERLAY": "Support or geometry overlay" };
  function gpill(g) { return '<span class="gpill g-' + esc(g) + '" title="' + esc(GTIP[g] || "") + '">' + esc(g) + " · " + esc(GNAME[g] || g) + "</span>"; }
  function lchip(l) { return l ? '<span class="lvl l-' + esc(l) + '" title="' + esc(LVL[l] || "") + '">' + esc(l) + "</span>" : '<span class="lvl">?</span>'; }
  function go(kind, id, label, extra) { return '<button type="button" class="chip link' + (extra ? " " + extra : "") + '" data-go="' + esc(kind) + ":" + esc(id) + '">' + esc(label) + "</button>"; }
  function aChip(id) { var a = byA[id]; return a ? go("assets", id, a.name.split(" · ").pop()) : '<span class="chip">' + esc(id) + "</span>"; }
  function sChip(id) { var s = byS[id]; return s ? go("scenes", id, s.name) : '<span class="chip">' + esc(id) + "</span>"; }
  function eChip(id) { var e = byE[id]; return e ? go("experiments", id, e.name) : '<span class="chip">' + esc(id) + "</span>"; }
  function count(list, f) { var n = 0; list.forEach(function (x) { if (f(x)) n++; }); return n; }

  /* view switcher */
  var views = $("#views");
  views.innerHTML = [["assets", "Assets", A.length], ["scenes", "Scenes", SC.length], ["experiments", "Experiments", EX.length]].map(function (v) {
    return '<button class="subtab" type="button" data-view="' + v[0] + '">' + v[1] + ' <span class="cnt">' + v[2] + "</span></button>";
  }).join("");
  views.addEventListener("click", function (e) { var b = e.target.closest("[data-view]"); if (b) location.hash = "#" + b.getAttribute("data-view"); });

  /* ---------- assets ---------- */
  var af = { q: "", cat: "", grade: "", lvl: "", orient: false };
  function assetsView() {
    var cats = {}; A.forEach(function (a) { cats[a.cat] = (cats[a.cat] || 0) + 1; });
    var tiles = "ABCD".split("").map(function (g) {
      return '<button type="button" class="vtile g-' + g + (af.grade === g ? " on" : "") + '" data-grade="' + g + '"><span class="vt-n">' + count(A, function (a) { return a.grade === g; }) +
        '</span><span class="vt-l">' + esc(GNAME[g]) + '</span><span class="vt-d">' + esc(GTIP[g]) + "</span></button>";
    }).join("");
    var lv = ["L0", "L1", "L2", "L3", "L4"].map(function (l) {
      var n = count(A, function (a) { return a.lvl === l; });
      return '<button type="button" class="lseg' + (af.lvl === l ? " on" : "") + '" data-lvl="' + l + '" style="flex-grow:' + Math.max(n, 24) + '"><b>' + l + " · " + n + "</b><span>" + esc(LVL[l]) + "</span></button>";
    }).join("");
    return '<div class="vtiles">' + tiles + "</div>" +
      '<div class="lvlbar-wrap"><div class="lvlbar-head">Readiness level <span class="muted">(how far each asset has been checked)</span></div><div class="lvlbar">' + lv + "</div></div>" +
      '<div class="filters"><input id="aq" type="search" placeholder="Search name or id" value="' + esc(af.q) + '" aria-label="Search assets">' +
      '<select id="acat" aria-label="Category"><option value="">All categories</option>' + Object.keys(cats).sort().map(function (c) { return '<option value="' + esc(c) + '"' + (af.cat === c ? " selected" : "") + ">" + esc(c) + " (" + cats[c] + ")</option>"; }).join("") + "</select>" +
      '<select id="agrade" aria-label="Verdict"><option value="">All verdicts</option>' + "ABCD".split("").map(function (g) { return '<option value="' + g + '"' + (af.grade === g ? " selected" : "") + ">" + g + " · " + GNAME[g] + "</option>"; }).join("") + "</select>" +
      '<select id="alvl" aria-label="Readiness level"><option value="">All levels</option>' + ["L0", "L1", "L2", "L3", "L4"].map(function (l) { return '<option value="' + l + '"' + (af.lvl === l ? " selected" : "") + ">" + l + " · " + LVL[l] + "</option>"; }).join("") + "</select>" +
      '<label class="chk"><input id="aor" type="checkbox"' + (af.orient ? " checked" : "") + "> Needs your orientation decision (" + count(A, function (a) { return a.orient && a.orient.length; }) + ")</label>" +
      '<button type="button" class="linkish" id="areset">Clear filters</button></div>' +
      '<div class="rcount" id="acount"></div><div class="rows" id="arows" role="list"></div>';
  }
  function assetRows() {
    var q = af.q.trim().toLowerCase();
    var list = A.filter(function (a) {
      return (!q || (a.name + " " + a.id + " " + a.fn).toLowerCase().indexOf(q) >= 0) && (!af.cat || a.cat === af.cat) && (!af.grade || a.grade === af.grade) &&
        (!af.lvl || a.lvl === af.lvl) && (!af.orient || (a.orient && a.orient.length));
    });
    $("#acount").textContent = "Showing " + list.length + " of " + A.length + " assets";
    $("#arows").innerHTML = '<div class="rhead arow"><span>Asset</span><span>Category</span><span>What it is for</span><span>Verdict</span><span>Level</span><span>Moving parts</span><span>Scenes</span></div>' +
      list.map(function (a) {
        return '<button type="button" class="arow" role="listitem" data-go="assets:' + esc(a.id) + '"><span class="an"><b>' + esc(a.name) + '</b><code>' + esc(a.id) + "</code></span>" +
          '<span class="ac">' + esc(a.cat) + '</span><span class="af">' + esc(a.fn) + "</span><span>" + gpill(a.grade) + "</span><span>" + lchip(a.lvl) + "</span>" +
          '<span class="am">' + (a.joints ? a.joints + " movable" + (a.cycles ? " · " + a.cycles + " confirmed" : "") : '<span class="muted">none</span>') + "</span>" +
          '<span class="as">' + (a.scenes.length || '<span class="muted">0</span>') + (a.orient && a.orient.length ? ' <span class="flag" title="Needs your orientation decision">⚑</span>' : "") + "</span></button>";
      }).join("");
  }
  function bindAssets() {
    $("#view").querySelectorAll("[data-grade]").forEach(function (b) { b.addEventListener("click", function () { af.grade = af.grade === b.getAttribute("data-grade") ? "" : b.getAttribute("data-grade"); render(); }); });
    $("#view").querySelectorAll("[data-lvl]").forEach(function (b) { b.addEventListener("click", function () { af.lvl = af.lvl === b.getAttribute("data-lvl") ? "" : b.getAttribute("data-lvl"); render(); }); });
    $("#aq").addEventListener("input", function () { af.q = this.value; assetRows(); });
    $("#acat").addEventListener("change", function () { af.cat = this.value; assetRows(); });
    $("#agrade").addEventListener("change", function () { af.grade = this.value; render(); });
    $("#alvl").addEventListener("change", function () { af.lvl = this.value; render(); });
    $("#aor").addEventListener("change", function () { af.orient = this.checked; assetRows(); });
    $("#areset").addEventListener("click", function () { af = { q: "", cat: "", grade: "", lvl: "", orient: false }; render(); });
    assetRows();
  }
  function assetDetail(a) {
    var sec = function (t, body) { return body ? '<section class="dsec"><h3>' + t + "</h3>" + body + "</section>" : ""; };
    return '<div class="dhead"><div class="dkind">Asset · ' + esc(a.cat) + (a.kind ? " · " + esc(a.kind) : "") + " · " + esc(a.src) + '</div><h2>' + esc(a.name) + "</h2><code>" + esc(a.id) + "</code></div>" +
      '<div class="dverdict g-' + esc(a.grade) + '">' + gpill(a.grade) + "<p>" + esc(C.grade_long[a.grade] || GTIP[a.grade]) + "</p>" + (a.disp ? '<p class="muted">' + esc(a.disp) + "</p>" : "") + "</div>" +
      sec("What it is for", "<p>" + esc(a.fn || "—") + "</p>") +
      sec("Why this verdict", a.why ? "<p>" + esc(a.why) + "</p>" : "") +
      sec("Still needed", a.todo.length ? "<ul>" + a.todo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
      sec("Already fixed", a.repairs.length ? "<ul>" + a.repairs.map(function (t) { return "<li>" + esc(REPAIR[t] || t) + "</li>"; }).join("") + "</ul>" : "") +
      sec("Readiness", "<p>" + lchip(a.lvl) + " " + esc(LVL[a.lvl] || "") + "</p>" + (a.lvl_note ? '<p class="muted">' + esc(a.lvl_note) + "</p>" : "")) +
      sec("Moving parts and physics", '<dl class="kv"><dt>Movable joints</dt><dd>' + (a.joints || 0) + "</dd><dt>Joints with a drive</dt><dd>" + (a.driven || 0) + "</dd><dt>Confirmed in 3 full cycles</dt><dd>" + (a.cycles || 0) +
        "</dd><dt>Collision shapes</dt><dd>" + (a.colliders == null ? "—" : a.colliders) + "</dd><dt>Function tests passed / failed</dt><dd>" + (a.tests[0] || 0) + " / " + (a.tests[1] || 0) + "</dd><dt>Mass</dt><dd>" + esc(a.mass) + "</dd></dl>" +
        (a.confirmed ? '<p class="muted">Confirmed in scenes: ' + esc(a.confirmed) + "</p>" : "")) +
      (a.orient && a.orient.length ? sec("Needs your decision", "<p>Which way is " + esc(a.orient.join(" and ")) + " for this asset. F1 has a picture pack for it.</p>") : "") +
      sec("Used in scenes", a.scenes.length ? '<div class="chips">' + a.scenes.map(sChip).join("") + "</div>" : '<p class="muted">Not placed in any scene yet.</p>') +
      sec("Needed by experiments", a.exps.length ? '<div class="chips">' + a.exps.map(eChip).join("") + "</div>" : "");
  }

  /* ---------- scenes ---------- */
  var sf = { q: "", type: "" };
  function scenesView() {
    var types = {}; SC.forEach(function (s) { types[s.type] = (types[s.type] || 0) + 1; });
    var ready = count(SC, function (s) { return s.ready.length; });
    return '<div class="vtiles s3"><div class="vtile static g-A"><span class="vt-n">' + ready + '</span><span class="vt-l">Ready for an experiment</span><span class="vt-d">Has every instrument, moving part and piece of labware one experiment needs (robot skills not counted).</span></div>' +
      '<div class="vtile static g-B"><span class="vt-n">' + count(SC, function (s) { return s.close.length; }) + '</span><span class="vt-l">Close to an experiment</span><span class="vt-d">A few listed items missing for at least one experiment.</span></div>' +
      '<div class="vtile static g-C"><span class="vt-n">' + count(SC, function (s) { return s.now_full.length; }) + '</span><span class="vt-l">Can run one end to end today</span><span class="vt-d">Scene complete and every robot skill qualified. None yet.</span></div></div>' +
      '<div class="filters"><input id="sq" type="search" placeholder="Search scenes" value="' + esc(sf.q) + '" aria-label="Search scenes">' +
      '<select id="stype" aria-label="Scene type"><option value="">All types</option>' + Object.keys(types).map(function (t) { return '<option value="' + esc(t) + '"' + (sf.type === t ? " selected" : "") + ">" + esc(t) + " (" + types[t] + ")</option>"; }).join("") + "</select></div>" +
      '<div class="rcount" id="scount"></div><div class="scards" id="scards"></div>';
  }
  function sceneCards() {
    var q = sf.q.trim().toLowerCase();
    var list = SC.filter(function (s) { return (!q || (s.name + " " + s.name_zh + " " + s.summary).toLowerCase().indexOf(q) >= 0) && (!sf.type || s.type === sf.type); });
    $("#scount").textContent = "Showing " + list.length + " of " + SC.length + " scenes";
    $("#scards").innerHTML = list.map(function (s) {
      var mp = s.mp && s.mp[1] ? '<span>Moving parts ' + (s.mp[0] || 0) + "/" + s.mp[1] + '</span><div class="bar"><i style="width:' + Math.min(100, 100 * (s.mp[0] || 0) / s.mp[1]).toFixed(1) + '%"></i></div>' : "";
      return '<button type="button" class="scard" data-go="scenes:' + esc(s.id) + '">' +
        (s.img ? '<span class="sthumb"><img loading="lazy" alt="" src="' + esc(s.img) + '"></span>' : '<span class="sthumb none">' + esc(s.type) + "</span>") +
        '<span class="sbody"><span class="stitle">' + esc(s.name) + '</span><span class="smeta"><span class="tag">' + esc(s.type) + "</span>" + OL.pill(s.status) + "</span>" +
        '<span class="sstats"><span>' + (s.pick == null ? "?" : s.pick) + " objects to pick up</span>" + (s.n_instr ? "<span>" + s.n_instr + (s.n_instr === 1 ? " instrument" : " instruments") + "</span>" : "") + "</span>" + mp +
        (s.ready.length ? '<span class="ready">Ready for: ' + s.ready.map(esc).join(", ") + "</span>" : (s.close.length ? '<span class="close">Close to ' + s.close.length + " experiment" + (s.close.length > 1 ? "s" : "") + "</span>" : "")) +
        "</span></button>";
    }).join("");
  }
  function bindScenes() {
    $("#sq").addEventListener("input", function () { sf.q = this.value; sceneCards(); });
    $("#stype").addEventListener("change", function () { sf.type = this.value; sceneCards(); });
    sceneCards();
  }
  function sceneDetail(s) {
    var sec = function (t, body) { return body ? '<section class="dsec"><h3>' + t + "</h3>" + body + "</section>" : ""; };
    var list = function (xs) { return xs.length ? "<ul>" + xs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; };
    var instr = s.instruments.filter(function (i) { return byA[i]; });
    return (s.img ? '<div class="dimg"><img alt="' + esc(s.name) + '" src="' + esc(s.img) + '"></div>' : "") +
      '<div class="dhead"><div class="dkind">Scene · ' + esc(s.type) + '</div><h2>' + esc(s.name) + "</h2>" + (s.name_zh && s.name_zh !== s.name ? '<div class="muted">' + esc(s.name_zh) + "</div>" : "") + "<div>" + OL.pill(s.status) + "</div></div>" +
      '<dl class="kv"><dt>Objects that can be picked up</dt><dd>' + (s.pick == null ? "unknown" : s.pick) + "</dd><dt>Moving parts confirmed</dt><dd>" + (s.mp && s.mp[1] ? (s.mp[0] || 0) + " of " + s.mp[1] : "—") + "</dd><dt>Instruments</dt><dd>" + (s.n_instr || instr.length || "—") + "</dd></dl>" +
      sec("Ready for (scene side)", s.ready.length ? '<p class="ok">' + s.ready.map(esc).join(", ") + '</p><p class="muted">Every instrument, moving part and labware item is in place. Robot skills are not counted.</p>' : '<p class="muted">No experiment yet.</p>') +
      sec("Close to (what is missing)", list(s.close)) +
      sec("Not possible here", list(s.no)) +
      sec("Status", "<p>" + esc(s.summary) + "</p>") +
      sec("Appearance", s.appearance ? "<p>" + esc(s.appearance) + "</p>" : "") +
      sec("Instruments in this scene", instr.length ? '<div class="chips">' + instr.map(aChip).join("") + "</div>" : "");
  }

  /* ---------- experiments ---------- */
  function expView() {
    return '<div class="rcount">' + EX.length + ' experiments and plans. "Scene ready in" means a room has everything except qualified robot skills; none can yet run end to end.</div>' +
      '<div class="rows"><div class="rhead erow"><span>Experiment</span><span>Steps</span><span>Scene ready in</span><span>What is missing</span></div>' +
      EX.map(function (e) {
        return '<button type="button" class="erow" data-go="experiments:' + esc(e.id) + '"><span class="an"><b>' + esc(e.name) + "</b><code>" + esc(e.suite) + "</code></span><span>" + esc(e.steps || "—") +
          "</span><span>" + (e.scene_ready_in.length ? e.scene_ready_in.map(function (id) { return '<span class="okchip">' + esc(byS[id] ? byS[id].name : id) + "</span>"; }).join(" ") : '<span class="muted">none yet</span>') +
          '</span><span class="af">' + esc(e.gaps || e.missing) + "</span></button>";
      }).join("") + "</div>";
  }
  function expDetail(e) {
    var sec = function (t, body) { return body ? '<section class="dsec"><h3>' + t + "</h3>" + body + "</section>" : ""; };
    return '<div class="dhead"><div class="dkind">Experiment · ' + esc(e.suite) + '</div><h2>' + esc(e.name) + "</h2><code>" + esc(e.id) + "</code></div>" +
      '<dl class="kv"><dt>Steps</dt><dd>' + esc(e.steps || "—") + "</dd><dt>Runs end to end today</dt><dd>" + esc(e.runnable) + "</dd></dl>" +
      sec("Scene ready in", e.scene_ready_in.length ? '<div class="chips">' + e.scene_ready_in.map(sChip).join("") + "</div>" : '<p class="muted">No room has everything yet.</p>') +
      sec("Candidate scenes", e.scenes.length ? '<div class="chips">' + e.scenes.map(sChip).join("") + "</div>" : "") +
      sec("What is missing", "<p>" + esc(e.missing || "—") + "</p>") +
      sec("Instruments it needs", e.instruments.length ? '<div class="chips">' + e.instruments.map(aChip).join("") + "</div>" : "") +
      sec("Source check", e.source ? "<p>" + esc(e.source) + "</p>" : "");
  }

  /* ---------- drawer + routing ---------- */
  var drawer = $("#drawer"), dbody = $("#dbody"), lastFocus = null;
  function openDrawer(html) {
    dbody.innerHTML = html; drawer.hidden = false; document.body.classList.add("drawer-open");
    lastFocus = document.activeElement; $("#dclose").focus(); dbody.scrollTop = 0;
  }
  function closeDrawer() {
    drawer.hidden = true; document.body.classList.remove("drawer-open");
    var v = (location.hash.replace(/^#/, "").split("/")[0]) || "assets";
    history.replaceState(null, "", "#" + v);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("#dclose").addEventListener("click", closeDrawer);
  $("#dback").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) closeDrawer(); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]"); if (!b) return;
    var p = b.getAttribute("data-go"), i = p.indexOf(":");
    location.hash = "#" + p.slice(0, i) + "/" + encodeURIComponent(p.slice(i + 1));
  });

  var current = "";
  function render() {
    var v = current;
    views.querySelectorAll("[data-view]").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-view") === v ? "true" : "false"); });
    if (v === "scenes") { $("#view").innerHTML = scenesView(); bindScenes(); }
    else if (v === "experiments") { $("#view").innerHTML = expView(); }
    else { $("#view").innerHTML = assetsView(); bindAssets(); }
  }
  function route() {
    var h = location.hash.replace(/^#/, ""), k = h.indexOf("/");
    var v = (k < 0 ? h : h.slice(0, k)) || "assets", id = k < 0 ? "" : decodeURIComponent(h.slice(k + 1));
    if (["assets", "scenes", "experiments"].indexOf(v) < 0) v = "assets";
    if (v !== current) { current = v; render(); }
    if (id) {
      var item = v === "assets" ? byA[id] : v === "scenes" ? byS[id] : byE[id];
      if (item) openDrawer(v === "assets" ? assetDetail(item) : v === "scenes" ? sceneDetail(item) : expDetail(item));
    } else if (!drawer.hidden) { drawer.hidden = true; document.body.classList.remove("drawer-open"); }
  }
  window.addEventListener("hashchange", route);
  route();
})();
