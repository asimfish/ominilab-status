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
  $("#tabs").innerHTML = '<a class="tab" href="agents.html">Plan &amp; progress</a><a class="tab" href="updates.html">进展快报</a><a class="tab" href="vanguard.html">先锋实验</a>' + steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" aria-selected="true" href="catalog.html">Assets &amp; scenes</a><a class="tab" href="real2sim.html">Real2sim</a><a class="tab" href="index.html#summary">Goals &amp; timeline</a>';

  var A = C.assets, SC = C.scenes, EX = C.experiments;
  var byA = {}, byS = {}, byE = {};
  A.forEach(function (a) { byA[a.id] = a; }); SC.forEach(function (s) { byS[s.id] = s; }); EX.forEach(function (e) { byE[e.id] = e; });

  var GNAME = { A: "Fully operable", B: "Fixable", C: "Display only", D: "Not yet operable", N: "Not in library yet" };
  var GTIP = { A: "Its main function works in the tested set-up, checked both ways.", B: "Has the parts it needs; a known fix or wiring step remains, then a function test.",
               C: "Only a static model for its intended function.", D: "Missing parts or proof of function that cannot be fixed automatically yet.",
               N: "A usable SafeLab model the census found that F1 has not annotated yet, so it has no verdict." };
  var LVL = { L0: "Fails to load, or not stable", L1: "Loads and rests stably", L1s: "Only a surface", L2: "Operable as an object",
              L3: "Annotated: usable for scenes", L4: "Robot-confirmed parts or grasps", L5: "Performs its function" };
  var LVL_ORDER = ["L0", "L1", "L1s", "L2", "L3", "L4", "L5"];
  var LVL_HOW = [["L0", "Fails to load or has no geometry, or does not stay still when placed on a table."],
    ["L1", "Loads at the right size and rests stably when placed. If it has moving parts, none has yet been shown to open fully."],
    ["L1s", "Only a surface: it looks right, but the structure its use needs is missing. Examples: an instrument with no door, lid, button or knob that moves; a cabinet that cannot open; an object with no collision body; a vessel whose collision body fills the inside. These are repair candidates."],
    ["L2", "Operable as an object, though not necessarily by a robot. It has a collision body. Vessels also need an open cavity, and anything with moving parts (doors, lids, drawers, buttons; levelling feet do not count) needs at least one part shown opening through 90% or more of its range in F1's physics test."],
    ["L3", "L2, plus all five scene checks from object annotation (F1) pass: size and footprint, support surface, upright, stable at rest, and front direction. It can be placed in a scene correctly."],
    ["L4", "Its moving parts or grasps are confirmed working in Isaac Sim: three full cycles with contact reports shown to be active and no engine errors, or a confirmed grasp library. None yet: the 2026-11-22 re-check found no cycle record that proves contact reporting was active."],
    ["L5", "It performs its experimental function end to end, for example a balance giving the right reading. None yet."]];
  var SRC = ["ChemLab", "SafeLab", "Other"];
  var CLS = ["Glassware & vessels", "Instruments", "Tools"];
  var CLS_TIP = { "Glassware & vessels": "Transparent or fragile containers that hold, measure or transfer liquids and powders",
                  Instruments: "Equipment with actuated parts (doors, lids, buttons) or force and signal sensing",
                  Tools: "Hand tools, supports, racks, clamps, pipettes, benches and cabinets that position or carry other objects" };
  var SRC_TIP = { ChemLab: "MBZUAI ChemLab-Assets (open source, CC BY-NC 4.0)", SafeLab: "Our own SafeLab models", Other: "Any other source" };
  var COLNAME = { mesh: "exact mesh", primitive: "primitive shape", convexHull: "convex hull", convexDecomposition: "convex pieces", none: "exact mesh", meshSimplification: "simplified mesh", sdf: "signed-distance field",
                  boundingCube: "bounding box", boundingSphere: "bounding sphere", shape: "primitive shape" };
  var COLHEX = { mesh: "#f39c33", primitive: "#e6a1b5", convexHull: "#4a90e2", convexDecomposition: "#2bb673", none: "#f39c33", meshSimplification: "#f39c33", sdf: "#a66bd6", boundingCube: "#e0c341", boundingSphere: "#e0c341", shape: "#e6a1b5" };
  var REPAIR = { "关节状态元数据补全": "Joint states annotated", "EXISTING_GEOMETRY_OR_SUPPORT_OVERLAY": "Support or geometry overlay" };
  function gpill(g) { return '<span class="gpill g-' + esc(g) + '" title="' + esc(GTIP[g] || "") + '">' + esc(g) + " · " + esc(GNAME[g] || g) + "</span>"; }
  function lname(l) { return l === "L1s" ? "L1-S" : l; }
  function lchip(l) { return l ? '<span class="lvl l-' + esc(l) + '" title="' + esc(LVL[l] || "") + '">' + esc(lname(l)) + "</span>" : '<span class="lvl" title="Not assessed yet">?</span>'; }
  function srcTag(s) { return '<span class="srctag s-' + esc(s) + '" title="' + esc(SRC_TIP[s] || "") + '">' + esc(s) + "</span>"; }
  function go(kind, id, label, extra) { return '<button type="button" class="chip link' + (extra ? " " + extra : "") + '" data-go="' + esc(kind) + ":" + esc(id) + '">' + esc(label) + "</button>"; }
  function aChip(id) { var a = byA[id]; return a ? go("assets", id, a.name.split(" · ").pop()) : '<span class="chip">' + esc(id) + "</span>"; }
  function sChip(id) { var s = byS[id]; return s ? go("scenes", id, s.name) : '<span class="chip">' + esc(id) + "</span>"; }
  function eChip(id) { var e = byE[id]; return e ? go("experiments", id, e.name) : '<span class="chip">' + esc(id) + "</span>"; }
  function count(list, f) { var n = 0; list.forEach(function (x) { if (f(x)) n++; }); return n; }
  function thumb(a, cls) { return a.th ? '<img class="' + cls + '" loading="lazy" decoding="async" alt="" src="' + esc(a.th) + '">' : '<span class="' + cls + ' none" aria-hidden="true"></span>'; }
  function dims(s) { return s ? (s[0] * 100).toFixed(0) + " × " + (s[2] * 100).toFixed(0) + " × " + (s[1] * 100).toFixed(0) + " cm" : ""; }

  /* view switcher */
  var views = $("#views");
  var LF = window.LAB_FAMILIES;
  views.innerHTML = [["assets", "Assets", A.length], ["scenes", "Scenes", SC.length], ["experiments", "Experiments", EX.length]].concat(LF ? [["families", "代表实验与评级", 50]] : []).concat(window.F1ACC ? [["accept", "验收看板", window.F1ACC.count]] : []).map(function (v) {
    return '<button class="subtab" type="button" data-view="' + v[0] + '">' + v[1] + ' <span class="cnt">' + v[2] + "</span></button>";
  }).join("");
  views.addEventListener("click", function (e) { var b = e.target.closest("[data-view]"); if (b) location.hash = "#" + b.getAttribute("data-view"); });

  /* ---------- assets ---------- */
  var af = { q: "", cls: "", sub: "", grade: "", lvl: "", src: "", orient: false }, aview = OL.store.get("catalogView") === "grid" ? "grid" : "list";
  function assetsView() {
    var subs = {}; A.forEach(function (a) { if (!af.cls || a.cls === af.cls) subs[a.sub] = (subs[a.sub] || 0) + 1; });
    var clsbar = CLS.map(function (c) {
      return '<button type="button" class="clsseg' + (af.cls === c ? " on" : "") + '" data-cls="' + esc(c) + '" title="' + esc(CLS_TIP[c]) + '"><b>' + count(A, function (a) { return a.cls === c; }) +
        "</b><span>" + esc(c) + '</span><small>' + esc(CLS_TIP[c]) + "</small></button>";
    }).join("");
    var tiles = "ABCDN".split("").map(function (g) {
      return '<button type="button" class="vtile g-' + g + (af.grade === g ? " on" : "") + '" data-grade="' + g + '"><span class="vt-n">' + count(A, function (a) { return a.grade === g; }) +
        '</span><span class="vt-l">' + esc(GNAME[g]) + '</span><span class="vt-d">' + esc(GTIP[g]) + "</span></button>";
    }).join("");
    var lv = LVL_ORDER.map(function (l) {
      var n = count(A, function (a) { return a.lv === l; });
      return '<button type="button" class="lseg l-' + l + (af.lvl === l ? " on" : "") + '" data-lvl="' + l + '" style="flex-grow:' + Math.max(n, 22) + '"><b>' + lname(l) + " · " + n + "</b><span>" + esc(LVL[l]) + "</span></button>";
    }).join("");
    var na = count(A, function (a) { return !a.lv; });
    var srcbar = SRC.map(function (s) {
      var n = count(A, function (a) { return a.src === s; });
      return '<button type="button" class="srcseg s-' + s + (af.src === s ? " on" : "") + '" data-src="' + s + '"' + (n ? "" : " disabled") + ' title="' + esc(SRC_TIP[s]) + '"><b>' + n + "</b><span>" + s + "</span></button>";
    }).join("");
    return '<div class="clsbar">' + clsbar + "</div>" + '<div class="srcrow"><span class="srchead">Where the models come from</span><div class="srcbar">' + srcbar + '</div><span class="muted small">' + A.length + " assets in total</span></div>" +
      '<div class="vtiles s5">' + tiles + "</div>" +
      '<div class="lvlbar-wrap"><div class="lvlbar-head">Readiness level <span class="muted">(how far each asset has been checked' + (na ? "; " + na + " not assessed yet" : "") + ')</span></div><div class="lvlbar">' + lv + "</div>" +
      '<details class="lvlhow"><summary>How levels are decided</summary><dl>' + LVL_HOW.map(function (x) { return "<dt>" + lchip(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd>"; }).join("") +
      '</dl><p class="muted small">Each asset gets the highest level whose condition it meets. L2 is decided from F1\'s records: moving joints for instruments, collision bodies (and F1\'s cavity check for vessels) for everything else. That a joint exists does not yet prove it moves well; confirmed motion is L4.</p></details></div>' +
      '<div class="filters"><input id="aq" type="search" placeholder="Search name or id" value="' + esc(af.q) + '" aria-label="Search assets">' +
      '<select id="asub" aria-label="Subcategory"><option value="">' + (af.cls ? esc(af.cls) + ": all" : "All subcategories") + "</option>" + Object.keys(subs).sort().map(function (c) { return '<option value="' + esc(c) + '"' + (af.sub === c ? " selected" : "") + ">" + esc(c) + " (" + subs[c] + ")</option>"; }).join("") + "</select>" +
      '<select id="agrade" aria-label="Verdict"><option value="">All verdicts</option>' + "ABCDN".split("").map(function (g) { return '<option value="' + g + '"' + (af.grade === g ? " selected" : "") + ">" + g + " · " + GNAME[g] + "</option>"; }).join("") + "</select>" +
      '<select id="alvl" aria-label="Readiness level"><option value="">All levels</option>' + LVL_ORDER.map(function (l) { return '<option value="' + l + '"' + (af.lvl === l ? " selected" : "") + ">" + lname(l) + " · " + LVL[l] + "</option>"; }).join("") + "</select>" +
      '<select id="asrc" aria-label="Source"><option value="">All sources</option>' + SRC.map(function (s) { return '<option value="' + s + '"' + (af.src === s ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select>" +
      '<label class="chk"><input id="aor" type="checkbox"' + (af.orient ? " checked" : "") + "> Needs your orientation decision (" + count(A, function (a) { return a.orient && a.orient.length; }) + ")</label>" +
      '<button type="button" class="linkish" id="areset">Clear filters</button>' +
      '<span class="vswitch" role="group" aria-label="Layout"><button type="button" data-av="list" aria-pressed="' + (aview === "list") + '">☰ List</button><button type="button" data-av="grid" aria-pressed="' + (aview === "grid") + '">▦ Gallery</button></span></div>' +
      '<div class="rcount" id="acount"></div><div class="rows" id="arows" role="list"></div>';
  }
  function assetRows() {
    var q = af.q.trim().toLowerCase();
    var list = A.filter(function (a) {
      return (!q || (a.name + " " + a.id + " " + a.fn + " " + a.sub + " " + (a.sub_zh || "")).toLowerCase().indexOf(q) >= 0) && (!af.cls || a.cls === af.cls) && (!af.sub || a.sub === af.sub) && (!af.grade || a.grade === af.grade) &&
        (!af.lvl || a.lv === af.lvl) && (!af.src || a.src === af.src) && (!af.orient || (a.orient && a.orient.length));
    });
    $("#acount").textContent = "Showing " + list.length + " of " + A.length + " assets";
    // grouped by class, then subcategory, so the list is not one long crowd
    var groups = [];
    CLS.concat(["Other"]).forEach(function (c) {
      var inC = list.filter(function (a) { return (CLS.indexOf(a.cls) >= 0 ? a.cls : "Other") === c; });
      if (!inC.length) return;
      var subs = {}; inC.forEach(function (a) { (subs[a.sub] = subs[a.sub] || []).push(a); });
      groups.push([c, inC.length, Object.keys(subs).sort().map(function (s) { return [s, subs[s]]; })]);
    });
    var row = function (a) {
      return '<button type="button" class="arow" role="listitem" data-go="assets:' + esc(a.id) + '"><span class="an withthumb">' + thumb(a, "ath") + "<span><b>" + esc(a.name) + '</b><code>' + esc(a.id) + "</code></span></span>" +
        '<span class="ac">' + esc(a.sub) + "<br>" + srcTag(a.src) + '</span><span class="af">' + esc(a.fn) + "</span><span>" + gpill(a.grade) + "</span><span>" + lchip(a.lv) + "</span>" +
        '<span class="am">' + (a.joints ? a.joints + " movable" + (a.fj && a.fj[0] ? " · " + a.fj[1] + " open fully" : "") : '<span class="muted">none</span>') + "</span>" +
        '<span class="as">' + (a.scenes.length || '<span class="muted">0</span>') + (a.orient && a.orient.length ? ' <span class="flag" title="Needs your orientation decision">⚑</span>' : "") + "</span></button>";
    };
    var card = function (a) {
      return '<button type="button" class="acard" role="listitem" data-go="assets:' + esc(a.id) + '">' + thumb(a, "acthumb") +
        '<span class="acbody"><b>' + esc(a.name) + "</b><code>" + esc(a.id) + '</code><span class="acmeta">' + gpill(a.grade) + lchip(a.lv) + srcTag(a.src) +
        (a.orient && a.orient.length ? ' <span class="flag" title="Needs your orientation decision">⚑</span>' : "") + "</span></span></button>";
    };
    var many = list.length > 40;
    $("#arows").className = "agroups";
    $("#arows").innerHTML = groups.map(function (g) {
      return '<section class="aclass"><h3 class="aclass-h">' + esc(g[0]) + ' <span class="muted">' + g[1] + "</span></h3>" + g[2].map(function (s) {
        return '<details class="asub"' + (many && g[2].length > 1 && s[1].length > 12 ? "" : " open") + '><summary><b>' + esc(s[0]) + '</b> <span class="muted">' + s[1].length + "</span></summary>" +
          (aview === "grid" ? '<div class="agrid">' + s[1].map(card).join("") + "</div>"
            : '<div class="rows"><div class="rhead arow"><span>Asset</span><span>Subcategory</span><span>What it is for</span><span>Verdict</span><span>Level</span><span>Moving parts</span><span>Scenes</span></div>' + s[1].map(row).join("") + "</div>") +
          "</details>";
      }).join("") + "</section>";
    }).join("") || '<p class="muted">No asset matches these filters.</p>';
  }
  function bindAssets() {
    $("#view").querySelectorAll("[data-grade]").forEach(function (b) { b.addEventListener("click", function () { af.grade = af.grade === b.getAttribute("data-grade") ? "" : b.getAttribute("data-grade"); render(); }); });
    $("#view").querySelectorAll("[data-lvl]").forEach(function (b) { b.addEventListener("click", function () { af.lvl = af.lvl === b.getAttribute("data-lvl") ? "" : b.getAttribute("data-lvl"); render(); }); });
    $("#view").querySelectorAll("[data-src]").forEach(function (b) { b.addEventListener("click", function () { af.src = af.src === b.getAttribute("data-src") ? "" : b.getAttribute("data-src"); render(); }); });
    $("#asrc").addEventListener("change", function () { af.src = this.value; render(); });
    $("#aq").addEventListener("input", function () { af.q = this.value; assetRows(); });
    $("#asub").addEventListener("change", function () { af.sub = this.value; assetRows(); });
    $("#view").querySelectorAll("[data-cls]").forEach(function (b) { b.addEventListener("click", function () { var c = b.getAttribute("data-cls"); af.cls = af.cls === c ? "" : c; af.sub = ""; render(); }); });
    $("#agrade").addEventListener("change", function () { af.grade = this.value; render(); });
    $("#alvl").addEventListener("change", function () { af.lvl = this.value; render(); });
    $("#aor").addEventListener("change", function () { af.orient = this.checked; assetRows(); });
    $("#areset").addEventListener("click", function () { af = { q: "", cls: "", sub: "", grade: "", lvl: "", src: "", orient: false }; render(); });
    $("#view").querySelectorAll("[data-av]").forEach(function (b) { b.addEventListener("click", function () {
      aview = b.getAttribute("data-av"); OL.store.set("catalogView", aview);
      $("#view").querySelectorAll("[data-av]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      assetRows();
    }); });
    assetRows();
  }
  function assetDetail(a) {
    var sec = function (t, body) { return body ? '<section class="dsec"><h3>' + t + "</h3>" + body + "</section>" : ""; };
    var types = a.col_types ? Object.keys(a.col_types) : [];
    var media = a.th || a.glb || a.col ? '<div class="amedia" id="amedia">' + (a.th ? '<img class="abig" alt="' + esc(a.name) + '" src="' + esc(a.th) + '">' : "") +
      '<span class="v3dstat" id="v3dstat"></span>' + (a.ar ? '<div class="fpanel" id="fpanel" hidden></div>' : "") +
      (a.glb ? '<div class="v3dbar" id="v3dbar" hidden><span class="seg" role="group" aria-label="Show"><button type="button" data-m="model" aria-pressed="true">Model</button>' +
        (a.col ? '<button type="button" data-m="both" aria-pressed="false">Model + collision</button><button type="button" data-m="col" aria-pressed="false">Collision only</button>' : "") +
        '</span>' + (a.jm ? '<button type="button" class="tgl" id="jtgl" aria-pressed="false">Moving parts (' + a.jm.length + ")</button>" : "") +
        (a.col ? '<span class="seg cby" role="group" aria-label="Colour" hidden><button type="button" data-cb="kind" aria-pressed="true">Colour by type</button><button type="button" data-cb="part" aria-pressed="false">By part</button></span>' : "") +
        (a.ar ? '<button type="button" class="tgl" id="ptgl" aria-pressed="true" hidden>Parts &amp; functions</button><button type="button" class="tgl" id="opentgl" aria-pressed="false" hidden>Open doors &amp; lids</button>' : "") + '<button type="button" class="tgl fsbtn" data-fs aria-pressed="false">⛶ Full screen</button>' +
        '<span class="hint">Left-drag: orbit · right-drag: look around · right-drag + W A S D Q E: fly · middle-drag: pan · wheel: zoom · F: frame · double-click: fly to a point</span></div>' : "") + "</div>" +
      (a.ar ? '<div class="plegend" id="plegend" hidden></div>' : "") +
      (a.jm ? '<div class="jlegend" id="jlegend" hidden><span><i style="background:#0b5d2e"></i>confirmed in a formal run</span><span><i style="background:#1f9d55"></i>opened fully in F1 test</span><span><i style="background:#f08c00"></i>moved partly</span><span><i style="background:#d6336c"></i>did not move</span><span><i style="background:#8a94a6"></i>not tested</span><span class="muted">ring = hinge, arrow = slide</span></div>' : "") +
      (a.col ? '<div class="collegend" id="collegend" hidden>' + types.map(function (k) { return '<span><i style="background:' + (COLHEX[k] || "#888") + '"></i>' + esc(COLNAME[k] || k) + " × " + a.col_types[k] + "</span>"; }).join("") +
        '<span class="muted">Model + collision: green outlines, as in Isaac Sim · Collision only: the solid shapes the physics engine uses</span></div>' : "") +
      '<div class="ameta muted small">' + [dims(a.size), a.tris ? a.tris.toLocaleString("en-US") + " triangles" : "", a.kb ? a.kb + " KB" : ""].filter(Boolean).join(" · ") +
      (a.glb ? " · lightweight preview; the simulation uses the full model" : (a.no3d ? " · " + esc(a.no3d) : "")) + "</div>" : "";
    var colTxt = a.col_n == null ? "" : (a.col_n ? a.col_n + " collision shape" + (a.col_n === 1 ? "" : "s") + ": " + types.map(function (k) { return a.col_types[k] + " " + (COLNAME[k] || k); }).join(", ") + "." : "No collision body.") +
      (a.col_rep ? " After repair: " + a.col_n + " shapes, " + a.col_rep + "." : "") +
      (a.cavity ? " Cavity (F1 check): " + ({ OPEN_INTERIOR_FLOOR_AND_WALL_SAMPLED: "open, floor and walls sampled", UNRESOLVED_COOKED_SURFACES: "not resolved yet", GEOMETRY_WITNESS_INCOMPLETE: "evidence incomplete" }[a.cavity] || a.cavity) + "." : "");
    return media + '<div class="dhead"><div class="dkind">' + esc(a.cls) + " · " + esc(a.sub) + (a.sub_zh ? " (" + esc(a.sub_zh) + ")" : "") + " · " + srcTag(a.src) + '</div><h2>' + esc(a.name) + "</h2><code>" + esc(a.id) + "</code></div>" +
      '<div class="dverdict g-' + esc(a.grade) + '">' + gpill(a.grade) + "<p>" + esc(C.grade_long[a.grade] || GTIP[a.grade]) + "</p>" + (a.disp ? '<p class="muted">' + esc(a.disp) + "</p>" : "") + "</div>" +
      (a.grasp || a.trials || a.chk ? sec("Grasps and Studio rehearsals", chkAsset(a) +
        (a.grasp ? "<p><b>" + a.grasp[0] + " grasp candidates</b> from F2 (" + Object.keys(a.grasp[1]).map(function (k) { return a.grasp[1][k] + " " + k.toLowerCase().replace(/_/g, " "); }).join(", ") + ")" +
          (a.grasp[2] ? "; Studio held " + a.grasp[3] + " of " + a.grasp[2] + " tried in its CPU physics rehearsal" : "") + ". " + studioLink(a.grasp[4], "See the grasps in Studio") + "</p>" : "") +
        (a.trials ? trialCards(a.trials) : "") + '<p class="muted small">Studio rehearsals run in CPU physics (MuJoCo). They show the operation can work; the formal demonstration for G5 is a separate GPU run in Isaac Sim, approved by the manipulation lead.</p>') : "") +
      (a.ifi ? '<section class="dsec" id="ifisec"><h3>Automated functions an agent can call</h3><p class="muted small">Loading…</p></section>' :
        (a.auto ? sec("Automation", "<p>" + esc(AUTOTXT[a.auto[0]] || a.auto[0]) + (a.auto[1] ? " · " + esc(a.auto[1].replace(/_/g, " ")) : "") + (a.auto[2].length ? " · missing axes: " + esc(a.auto[2].join(", ")) : "") +
          '</p><p class="muted small">Its function interface (axes, named positions, callable functions) is not written yet' + (a.auto[3] ? " (priority " + esc(a.auto[3]) + ")" : "") + ".</p>") : "")) +
      (a.iop ? '<section class="dsec" id="iopsec"><h3>How it works and what it can do</h3><p class="muted small">Loading…</p></section>' : sec("What it is for", "<p>" + esc(a.fn || "—") + "</p>")) +
      sec("Readiness", "<p>" + lchip(a.lv) + " " + esc(LVL[a.lv] || "Not assessed yet") + "</p><p>" + esc(a.lv_why || "") + "</p>" + (a.lvl_note ? '<p class="muted">Census detail: ' + esc(a.lvl_note) + "</p>" : "")) +
      sec("Lid, cap or stopper", a.lid ? "<ul>" + a.lid.map(function (l) { return "<li><b>" + esc(l[0].replace(/_/g, " ")) + "</b>: " + esc(LIDTXT[l[1]] || l[1]) + "</li>"; }).join("") + "</ul>" +
        (a.glb && a.lidm ? '<p><button type="button" class="tgl" id="lidtgl" aria-pressed="false">Show the lid in 3D</button></p>' : "") +
        (a.lid.some(function (l) { return l[1] === "same"; }) ? '<p class="small warn">So in simulation this lid cannot be opened or removed. F1 is preparing a fix that makes it a separate part.</p>' : "") +
        '<p class="muted small">From the asset\'s USD. Check it with <b>Collision only</b> and <b>By part</b>: pieces in different colours are separate rigid bodies.</p>' : "") +
      sec("Used together with", a.used ? a.used.map(function (g) { return '<p class="small"><b>' + esc(g[0]) + '</b></p><div class="chips">' + g[1].map(aChip).join("") + "</div>"; }).join("") +
        '<p class="muted small">Draft pairing from your 11-22 rule (round vessels go with the equipment they are used in); F1 will confirm it.</p>' : "") +
      sec("Used in scenes", a.scenes.length ? '<div class="chips">' + a.scenes.map(sChip).join("") + "</div>" : '<p class="muted">Not placed in any scene yet.</p>') +
      sec("Needed by experiments", a.exps.length ? '<div class="chips">' + a.exps.map(eChip).join("") + "</div>" : "") +
      sec("Still needed", a.todo.length ? "<ul>" + a.todo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
      sec("Already fixed", a.repairs.length ? "<ul>" + a.repairs.map(function (t) { return "<li>" + esc(REPAIR[t] || t) + "</li>"; }).join("") + "</ul>" : "") +
      (a.orient && a.orient.length ? sec("Needs your decision", "<p>Which way is " + esc(a.orient.join(" and ")) + " for this asset. F1 has a picture pack for it.</p>") : "") +
      '<details class="techd"><summary><b>Technical details</b> <span class="muted small">F1 verdict text, joint test results, collision and physics numbers</span></summary>' +
      sec("F1 summary of its function", "<p>" + esc(a.fn || "—") + "</p>") +
      sec("Why this verdict", a.why ? "<p>" + esc(a.why) + "</p>" : "") +
      sec("Does it open?", a.fj && a.fj[0] ? "<p>" + a.fj[1] + " of " + a.fj[0] + " moving parts opened through at least 90% of their range in F1's physics test" + (a.fj[2] > a.fj[1] ? "; " + (a.fj[2] - a.fj[1]) + " more moved partly" : "") + ".</p>" +
        '<ul class="jlist">' + a.fj_list.map(function (j) { return "<li><code>" + esc(j[0]) + "</code> " + (j[1] ? (j[2] != null ? Math.round(j[2] * 100) + "% of its range" : "moved") : '<span class="muted">no motion seen</span>') + "</li>"; }).join("") + "</ul>"
        : (a.joints ? '<p class="muted">Has moving parts, but they have not been through F1\'s physics test.</p>' : "")) +
      sec("Collision body", colTxt ? "<p>" + esc(colTxt) + (a.parts ? " Rigid bodies: " + a.parts + (a.parts === 1 ? " (everything moves as one piece)." : ".") : "") + "</p>" + (a.col ? '<p class="muted">Use <b>Model + collision</b> above to see the shapes the physics engine uses, and <b>By part</b> to see which pieces are separate bodies.</p>' : "") : "") +
      sec("Moving parts and physics", '<dl class="kv"><dt>Movable joints</dt><dd>' + (a.joints || 0) + "</dd><dt>Joints with a drive</dt><dd>" + (a.driven || 0) + "</dd><dt>Full cycles observed (contacts unverified)</dt><dd>" + (a.cycles || 0) +
        "</dd><dt>Collision shapes</dt><dd>" + (a.colliders == null ? "—" : a.colliders) + "</dd><dt>Function tests passed / failed</dt><dd>" + (a.tests[0] || 0) + " / " + (a.tests[1] || 0) + "</dd><dt>Mass</dt><dd>" + esc(a.mass) + "</dd></dl>" +
        (a.confirmed ? '<p class="muted">Confirmed in scenes: ' + esc(a.confirmed) + "</p>" : "")) +
      "</details>";
  }

  /* ---------- scenes ---------- */
  var MAT = ["Ready", "Usable", "Building", "Draft", "Superseded"];
  var MAT_TIP = { Ready: "Has every instrument, moving part and piece of labware at least one experiment needs, and passes the formal stability check. Robot skills are not counted.",
                  Usable: "Passes the formal stability check; some items for its experiments are still missing.", Building: "Being built or checked; development evidence only.",
                  Draft: "An early layout that fails its checks. Kept for reference.", Superseded: "Replaced by a newer scene; kept for history." };
  var MATCLS = { Ready: "g-A", Usable: "g-B", Building: "g-D", Draft: "g-C", Superseded: "g-N" };
  function mechTxt(s) {
    if (s.mech && s.mech[2]) {
      var u = (s.mech[3] || 0) + (s.mech[4] || 0);
      return (s.mech[0] || 0) + "/" + s.mech[2] + " moving parts confirmed" + (s.mech[1] ? " (+" + s.mech[1] + " dev check)" : "") +
        (u ? " · " + u + " moved fully, contacts unverified" + (s.mech[4] ? " (" + s.mech[4] + " dev only)" : "") : "");
    }
    return s.mp && s.mp[1] ? (s.mp[0] || 0) + "/" + s.mp[1] + " moving parts confirmed" : "";
  }
  var sf = { q: "", kind: "", disc: "", origin: "", mat: "" };
  function opCount(ids) { var o = 0; ids.forEach(function (id) { var a = byA[id]; if (a && /^L[2-5]$/.test(a.lv)) o++; }); return o; }
  var SLV = [["L0", "Foundation", "A bare room, or a room built straight from a paper or a video that has not passed inspection."],
    ["L1", "Furnished for its experiments", "Instruments arranged from the experiments' needs, with a function analysis (which experiments it serves, what each one is missing)."],
    ["L2", "Physically sound", "Structure checks and the strict static-stability run pass in a formal run: nothing falls, sinks, floats or overlaps."],
    ["L3", "Operable for mobile manipulation", "Every instrument its experiments need has those operations confirmed in physics; a mobile robot can reach each station; operating one thing does not hit another."],
    ["L4", "Atomic tasks evaluated", "The atomic tasks at every station (open, close, pick, place, pour, press, …) pass repeated robot evaluation."],
    ["L5", "Closed-loop experiment", "At least one complete experiment has run end to end in this room, from plan to checked result."]];
  var SLVC = { L0: "#8a94a6", L1: "#d08700", L2: "#2f7fd8", L3: "#1f9d55", L4: "#7c4dff", L5: "#c2185b" };
  function slchip(lv) { var d = SLV.filter(function (x) { return x[0] === lv; })[0]; return lv ? '<span class="slchip" style="--c:' + SLVC[lv] + '" title="' + esc(d ? d[1] + ": " + d[2] : "") + '">' + esc(lv) + "</span>" : ""; }
  function isBaseLab(s) { return s.kind === "Room" && (s.origin === "Hand-built" || s.origin === "Rebuilt") && s.mat !== "Draft" && s.mat !== "Superseded"; }
  function gate(ok, txt, tip) { return '<span class="gate ' + ok + '" title="' + esc(tip || "") + '">' + esc(txt) + "</span>"; }
  // step1's acceptance report (G1–G5) uses these status words
  var GW = { pass: ["ok", "Passed"], pass_dev: ["part", "Passed (dev only)"], review: ["wait", "Your review"], open: ["no", "Open"], fail: ["no", "Failed"],
    ready: ["part", "Ready to demo"], demonstrated: ["ok", "Demonstrated"] };
  var GATES = [["G1", "Structure"], ["G2", "Appearance"], ["G3", "Stability"], ["G4", "Moving parts"], ["G5", "Experiments"]];
  function g3Text(a) {
    var d = a[2];
    return (a[1] ? "Formal run: " + a[1] + "." : "") + (d ? " With the new look, dev machine: " + d.steps + " steps, " + d.dynamic_bodies + " loose objects, peak drift " + d.peak_drift_mm + " mm / " + d.peak_rotation_deg + "°, " + d.engine_errors + " engine errors." : "");
  }
  function g4Text(a) { return a[2] + " of " + a[1] + " confirmed in a formal run, " + a[3] + " on the dev machine with a contact probe. " + (a[4] || ""); }
  function g5Text(a) {
    return (a[0] === "demonstrated" ? "A robot has completed an operation here in physics. " : "No robot operation demonstrated yet (needed to pass). ") +
      (a[3] && a[3].length ? "Ready to demonstrate: " + a[3].join("; ") + ". " : "") +
      (a[4] && a[4].length ? "Candidates: " + a[4].map(function (c) { return c[0] + (c[1].length ? " (blocked: " + c[1].join("; ") + ")" : ""); }).join(" | ") + ". " : "") +
      (a[2].length ? "Closest experiments: " + a[2].join("; ") : "");
  }
  function boardRow(s) {
    var A = s.acc, st = s.stab || {}, m = s.mech || [], u = (m[3] || 0) + (m[4] || 0), g1, g2, g3, g4, g5;
    var aw = function (a) { return GW[a && a[0]] || ["na", "–"]; };
    if (A) {
      g1 = gate(aw(A.G1)[0], aw(A.G1)[1], A.G1[1]);
      g2 = gate(aw(A.G2)[0], aw(A.G2)[1], A.G2[1]);
      g3 = gate(aw(A.G3)[0], aw(A.G3)[1], g3Text(A.G3));
      g4 = A.G4[1] ? gate(A.G4[2] >= A.G4[1] ? "ok" : (A.G4[2] || A.G4[3] ? "part" : "no"), A.G4[2] + "/" + A.G4[1] + (A.G4[3] ? " · +" + A.G4[3] + " dev" : " confirmed"), g4Text(A.G4)) : gate("na", "none planned");
      g5 = '<span class="gcell">' + gate(aw(A.G5)[0], aw(A.G5)[1] + (!s.chk && s.trials ? " · " + s.trials.filter(function (t) { return t.ok; }).length + " rehearsed" : ""), g5Text(A.G5) +
        (s.chk ? " Studio's whole-room CPU rehearsal passed " + s.chk.p + " of " + s.chk.t + " operations (not formal)." : "") + (s.trials ? " Studio CPU rehearsals of demo tasks passed: " + s.trials.filter(function (t) { return t.ok; }).map(function (t) { return t.label; }).join("; ") + "." : "")) +
        (s.chk ? '<span class="gsub">' + s.chk.p + "/" + s.chk.t + " rehearsed</span>" : "") + "</span>";
    } else {
      g1 = gate("na", "–", "No G1–G5 report from step 1 for this room yet");
      g3 = st.status === "pass" ? gate(st.ev === "formal" ? "ok" : "part", st.ev === "formal" ? "Passed (formal)" : "Passed (dev only)", st.batch) : gate("no", st.status ? "Not passed" : "Not run");
      g4 = m[2] ? gate(m[0] >= m[2] ? "ok" : (m[0] || m[1] ? "part" : "no"), (m[0] || 0) + "/" + m[2] + " confirmed" + (m[1] ? " (+" + m[1] + " dev)" : ""), u ? u + " moved fully, contacts unverified" : "") : gate("na", "none planned");
      g2 = gate(s.signed ? "ok" : "wait", s.signed ? "Approved" : "Your review", s.appearance || "");
      g5 = s.ready.length ? gate("ok", s.ready.length + " ready") : gate(s.close.length ? "part" : "no", s.close.length ? "close to " + s.close.length : "none yet");
    }
    return '<button type="button" class="brow" data-go="scenes:' + esc(s.id) + '"><span class="bthumb">' + (s.img ? '<img loading="lazy" alt="" src="' + esc(s.img) + '">' : "") + "</span>" +
      '<span class="bname"><b>' + esc(s.name) + '</b><span class="muted small">' + esc(s.disc) + (s.room ? " · 3D" : "") + "</span></span>" +
      '<span title="' + esc(s.slv_why + " " + s.slv_next) + '">' + slchip(s.slv) + "</span>" + g1 + g2 + g3 + g4 + g5 + "</button>";
  }
  // step1 round 10: new room types built and checked, not yet on the board (candidate_rooms)
  function candBlock() {
    var cs = C.cands || []; if (!cs.length) return "";
    return '<div class="cands"><h3 class="sgroup g-B">New room types in progress <span class="muted">' + cs.length + " · built by step 1 on 11-23, not yet on the board above</span></h3>" +
      '<div class="candgrid">' + cs.map(function (c) {
        return '<div class="cand"><b>' + esc(c.name) + "</b>" +
          '<div class="small">' + (c.l0 ? '<span class="opst" style="--c:' + (c.l0 === "PASS" ? "#1f9d55" : "#f08c00") + '">L0 ' + esc(c.l0) + (c.drift_mm != null ? " · " + c.drift_mm + " mm" : "") + "</span> " : "") +
          (c.lay ? '<span class="opst" style="--c:' + (c.lay[0] === c.lay[1] ? "#1f9d55" : "#f08c00") + '">layout rules ' + c.lay[0] + "/" + c.lay[1] + "</span> " : "") +
          (c.g1 ? '<span class="opst" style="--c:#1f9d55">G1 passed</span>' : "") + "</div>" +
          '<div class="small muted">' + esc(c.note) + "</div></div>";
      }).join("") + '</div><p class="muted small">' + esc((cs[0] && cs[0].arch) || "") + " Photos come next; each joins the board once it has a 3D export and pictures.</p></div>";
  }
  function scenesView() {
    var auto = SC.filter(function (s) { return s.build && s.build.mode; });
    var base = SC.filter(function (s) { return isBaseLab(s) && auto.indexOf(s) < 0; }), paper = SC.filter(function (s) { return !isBaseLab(s) && s.origin === "From a paper" && s.mat !== "Draft" && auto.indexOf(s) < 0; });
    var rest = SC.filter(function (s) { return base.indexOf(s) < 0 && paper.indexOf(s) < 0 && auto.indexOf(s) < 0; });
    var orig = base.filter(function (s) { return s.origin === "Hand-built"; }), rebuilt = base.filter(function (s) { return s.origin === "Rebuilt"; });
    return '<section class="board"><h2 class="sgroup g-A">Base labs to accept <span class="muted">' + base.length + " rooms · the original labs set the quality bar; a room is accepted when all five checks pass, including a robot completing an operation in it (G5)</span></h2>" +
      '<div class="brows"><div class="brow bhead"><span></span><span>Room</span><span>Level</span>' + GATES.map(function (g) { return "<span>" + g[1] + " (" + g[0] + ")</span>"; }).join("") + "</div>" +
      (orig.length ? '<div class="bsub">Original labs</div>' + orig.map(boardRow).join("") : "") +
      (rebuilt.length ? '<div class="bsub">Rebuilt labs</div>' + rebuilt.map(boardRow).join("") : "") + "</div>" +
      '<p class="muted small">Hover a check for its evidence; open a room for the full report. To sign off a room\'s appearance, open it, check the pictures, the Isaac collision picture and the 3D view, then tell HQ "approve &lt;room&gt;" or "reject &lt;room&gt; because …". "–" = step 1 has not reported this check for the room yet.</p></section>' +
      (auto.length ? '<section class="board autoboard"><h2 class="sgroup g-auto">Built automatically from papers <span class="muted">' + auto.length + " · one command from a paper to a lab where the robot runs the paper's experiment; not base labs</span></h2>" +
        '<p class="small">What the pipeline does by itself: reads the paper (text, figures, video frames) into a cited lab spec, chooses, collects or generates each instrument and repairs it to the project standard, lays out the lab, plans the robot, checks collisions and physics, and renders. Each card says what was still refined by the agent and why. In a scene built into a base lab, the 3D view\'s <b>Auto-built?</b> button colours what the build added.</p>' +
        '<div class="scards">' + auto.map(sceneCard).join("") + "</div></section>" : "") +
      candBlock() +
      levelsBlock() +
      '<details class="sgroup-d"><summary><h3 class="sgroup g-B">Rooms and benches built from papers <span class="muted">' + paper.length + " · generated from a paper by the auto scene builder</span></h3></summary>" +
      '<div class="scards">' + paper.map(sceneCard).join("") + "</div></details>" +
      '<details class="sgroup-d"><summary><h3 class="sgroup g-C">Floor, stations, drafts and history <span class="muted">' + rest.length + "</span></h3></summary>" +
      '<div class="scards">' + rest.map(sceneCard).join("") + "</div></details>";
  }
  function levelsBlock() {
    var n = {}; SC.forEach(function (s) { n[s.slv] = (n[s.slv] || 0) + 1; });
    return '<details class="slvbox"><summary><b>Scene levels</b> ' + SLV.map(function (x) { return slchip(x[0]) + '<span class="muted small"> ' + (n[x[0]] || 0) + "</span>"; }).join(" ") + ' <span class="muted small">· how levels are decided</span></summary>' +
      '<ol class="slvlist">' + SLV.map(function (x) { return "<li>" + slchip(x[0]) + " <b>" + esc(x[1]) + "</b> — " + esc(x[2]) + "</li>"; }).join("") + "</ol>" +
      '<p class="muted small">Each level needs all the ones below it. Appearance (your review, G2) is tracked separately: a room you have approved still climbs the levels by evidence. No room is above L2 yet: no moving part has been confirmed in a formal run and no robot task has been evaluated in a room.</p></details>';
  }
  function sceneCard(s) {
    var mt = mechTxt(s), mp = mt ? '<span class="sfact">' + esc(mt).replace(/^(\d+\/\d+)/, "<b>$1</b>") + "</span>" : "";
    var n = s.assets.length, op = opCount(s.assets), strip = s.assets.filter(function (id) { return byA[id] && byA[id].th && byA[id].cat === "Instrument"; }).slice(0, 7);
    return '<button type="button" class="scard" data-go="scenes:' + esc(s.id) + '">' +
      (s.img ? '<span class="sthumb"><img loading="lazy" alt="" src="' + esc(s.img) + '">' + (s.room ? '<span class="has3d">3D</span>' : "") + "</span>" : '<span class="sthumb none">No picture yet</span>') +
      '<span class="sbody"><span class="stitle">' + esc(s.name) + "</span>" +
      '<span class="smeta">' + slchip(s.slv) + '<span class="gpill ' + MATCLS[s.mat] + '">' + esc(s.mat) + '</span>' + (s.build && s.build.mode ? '<span class="autob">' + esc(s.build.badge || "Auto-built from paper") + "</span>" : "") + '<span class="tag">' + esc(s.kind) + " · " + esc(s.disc) + " · " + esc(s.origin) + "</span></span>" +
      '<span class="sfacts">' + (n ? '<span class="sfact"><b>' + op + "/" + n + "</b> assets operable</span>" : (s.n_instr ? '<span class="sfact"><b>' + s.n_instr + "</b> instruments (list pending)</span>" : "")) +
      mp + (s.pick != null ? '<span class="sfact"><b>' + s.pick + "</b> objects to pick up</span>" : "") + (s.robot ? '<span class="sfact">Robot: ' + esc(s.robot) + "</span>" : "") + "</span>" +
      (strip.length ? '<span class="astrip">' + strip.map(function (id) { return '<img loading="lazy" alt="" title="' + esc(byA[id].name) + '" src="' + esc(byA[id].th) + '">'; }).join("") + "</span>" : "") +
      (s.ready.length ? '<span class="ready">Ready for: ' + s.ready.map(esc).join(", ") + "</span>" : (s.close.length ? '<span class="close">Close to ' + s.close.length + " experiment" + (s.close.length > 1 ? "s" : "") + "</span>" : "")) +
      "</span></button>";
  }
  function bindScenes() {}
  function assetLine(id, x) {
    var a = byA[id], cnt = x && x.n > 1 ? '<span class="cnt">×' + x.n + "</span>" : "";
    if (!a) return '<div class="sasset other"><span class="ath none"></span><span class="sa-n"><b>' + esc(String(id).replace(/^unknown:/, "").replace(/_/g, " ")) + cnt + "</b><code>" + esc((x && x.role) || "") + " · not in the asset library</code></span></div>";
    return '<button type="button" class="sasset" data-go="assets:' + esc(id) + '">' + thumb(a, "ath") + '<span class="sa-n"><b>' + esc(a.name) + cnt + "</b><code>" + esc(a.cat) +
      (x && x.mech ? " · " + x.mech + " moving part" + (x.mech > 1 ? "s" : "") + " confirmed here" : "") + (x && x.mu ? " · " + x.mu + " moved fully, contacts unverified" : "") + "</code></span>" + lchip(a.lv) + gpill(a.grade) + "</button>";
  }
  function sceneDetail(s) {
    var sec = function (t, body) { return body ? '<section class="dsec"><h3>' + t + "</h3>" + body + "</section>" : ""; };
    var flist = function (xs) { return xs && xs.length ? "<ul>" + xs.map(function (x) { return "<li>" + esc(x.t) + (x.miss && x.miss.length ? '<div class="muted small">Missing: ' + x.miss.map(esc).join("; ") + "</div>" : "") + "</li>"; }).join("") + "</ul>" : ""; };
    var list = function (xs) { return xs.length ? "<ul>" + xs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; };
    var items = s.alist && s.alist.length ? s.alist : s.assets.map(function (id) { return { id: id }; });
    var isOp = function (x) { return byA[x.id] && /^L[2-5]$/.test(byA[x.id].lv); };
    var ops = items.filter(isOp), lib = items.filter(function (x) { return byA[x.id] && !isOp(x); }), other = items.filter(function (x) { return !byA[x.id]; });
    var nLib = ops.length + lib.length;
    var imgs = s.imgs && s.imgs.length ? s.imgs : (s.img ? [{ src: s.img, cap: "" }] : []);
    var colImg = imgs.reduce(function (r, im, i) { return r < 0 && im.col ? i : r; }, -1);
    var accSec = s.acc ? sec("Acceptance checks", '<dl class="kv acc">' + GATES.map(function (g) {
        var a = s.acc[g[0]], w = GW[a[0]] || ["na", a[0] || "not reported"];
        var body = g[0] === "G3" ? g3Text(a) : g[0] === "G4" ? g4Text(a) : g[0] === "G5" ? g5Text(a) : (a[1] || "");
        return "<dt>" + g[0] + " " + g[1] + '</dt><dd><span class="gate ' + w[0] + '">' + esc(w[1]) + "</span> " + esc(body) + "</dd>";
      }).join("") + '</dl><p class="muted small">Reported by step 1. "Dev only" = checked on the development machine, not yet in a formal platform run.</p>') : "";
    var media = imgs.length || s.room ? '<div class="amedia smedia" id="smedia">' + (imgs.length ? '<img class="abig cover" id="sbig" alt="' + esc(s.name) + '" src="' + esc(imgs[0].src) + '">' : "") +
        '<span class="v3dstat" id="v3dstat"></span>' + (s.room ? '<button type="button" class="btn v3d" id="room3d">View the room in 3D</button>' : "") +
        '<div class="oplegend" id="oplegend" hidden><b>Can it be operated?</b><span><i style="background:#2f9e44"></i>operable (L2+)</span><span><i style="background:#f08c00"></i>moves, not shown to work</span><span><i style="background:#e03131"></i>not operable</span><span><i style="background:#b8bec8"></i>room fixture</span></div>' +
        (s.build && s.build.auto_ids ? '<div class="oplegend" id="autolegend" hidden><b>What the build added</b><span><i style="background:#12b886"></i>' + esc(s.build.auto_label || 'built automatically from the paper') + '</span><span><i style="background:#b8bec8"></i>' + esc(s.build.base_label || 'the base room it was placed in') + '</span></div>' : '') +
        '<div class="v3dbar" id="v3dbar" hidden><span class="seg" role="group" aria-label="Show"><button type="button" data-rm="model" aria-pressed="true">Model</button><button type="button" data-rm="op" aria-pressed="false">Operable?</button>' + (s.build && s.build.auto_ids ? '<button type="button" data-rm="auto" aria-pressed="false">Auto-built?</button>' : "") + '<button type="button" data-rm="both" aria-pressed="false">Model + collision</button><button type="button" data-rm="col" aria-pressed="false">Collision only</button></span>' + '<span class="seg cby" role="group" aria-label="Colour" hidden><button type="button" data-cb="kind" aria-pressed="true">Colour by type</button><button type="button" data-cb="part" aria-pressed="false">By part</button></span>' +
        '<span class="seg" role="group" aria-label="Ceiling"><button type="button" data-cut="1" aria-pressed="true">Ceiling off</button><button type="button" data-cut="0" aria-pressed="false">On</button></span>' +
        (s.robots3d ? '<button type="button" class="tgl" data-robots aria-pressed="true">Robots (' + s.robots3d.length + ")</button>" : "") +
        '<button type="button" class="tgl fsbtn" data-fs aria-pressed="false">⛶ Full screen</button>' +
        '<span class="hint" id="pick">Left-drag: orbit · right-drag: look around · right-drag + W A S D Q E: fly (wheel = speed) · middle-drag: pan · F: frame · click an object to inspect and operate it</span></div></div>' +
        (imgs.length > 1 ? '<div class="sgal">' + imgs.map(function (im, i) { return '<button type="button" class="sg' + (im.col ? " sgcol" : "") + '" data-img="' + i + '" title="' + esc(im.cap) + '"><img loading="lazy" alt="' + esc(im.cap) + '" src="' + esc(im.src) + '">' + (im.col ? '<span class="sgtag">Isaac collision</span>' : "") + "</button>"; }).join("") + "</div>" +
          '<div class="ameta muted small" id="scap">' + esc(imgs[0].cap || "") + "</div>" : "") +
        (colImg >= 0 ? '<div class="ameta small"><button type="button" class="linkbtn" data-img="' + colImg + '">Isaac Sim\'s own collision view of this room</button> <span class="muted">— the same shapes Isaac draws with Show Collision Shapes (static colliders magenta, loose objects green / yellow). Compare it with "Collision only" in the 3D view.</span></div>' : "") +
        (s.room ? '<div class="ameta muted small">3D room: ' + s.room_n[0] + " objects, " + s.room_n[1] + " with their own 3D model; the rest are grey boxes of the right size." +
        (s.room_col ? " Collision view shows every placed asset plus the room's own colliders (" + Object.keys(s.room_col).map(function (k) { return s.room_col[k] + " " + (COLNAME[k] || k); }).join(", ") + ")." : " The room's own walls and benches have no collision export yet.") + "</div>" : "")
      : '<div class="dimg none muted">No picture yet.</div>';
    var stab = s.stab ? OL.pill(s.stab.status === "pass" ? "pass" : (s.stab.status === "fail" ? "fail" : "pending")) + ' <span class="muted small">' + esc((s.stab.ev === "formal" ? "formal run" : s.stab.ev === "dev" ? "development check only" : "") + (s.stab.batch ? " · " + s.stab.batch : "")) + "</span>" : OL.pill(s.status);
    return media +
      '<div class="dhead"><div class="dkind">Scene · ' + esc(s.kind) + " · " + esc(s.disc) + (s.disc2 ? " + " + esc(s.disc2) : "") + " · " + esc(s.origin) + '</div><h2>' + esc(s.name) + "</h2>" +
      (s.name_zh && s.name_zh !== s.name ? '<div class="muted">' + esc(s.name_zh) + "</div>" : "") +
      (s.formerly && s.formerly.length ? '<div class="muted small">Formerly: ' + s.formerly.map(esc).join("; ") + "</div>" : "") + "</div>" +
      '<div class="dverdict ' + MATCLS[s.mat] + '"><span class="gpill ' + MATCLS[s.mat] + '">' + esc(s.mat) + "</span><p>" + esc(MAT_TIP[s.mat]) +
        (s.sup_by ? " Replaced by " + (byS[s.sup_by] ? byS[s.sup_by].name : esc(s.sup_by)) + " (proposed by Step 1; waiting for your confirmation)." : "") + "</p></div>" +
      sec("Scene level", "<p>" + slchip(s.slv) + " <b>" + esc((SLV.filter(function (x) { return x[0] === s.slv; })[0] || [0, ""])[1]) + "</b> — " + esc(s.slv_why) + "</p><p><b>Next:</b> " + esc(s.slv_next) + "</p>" +
        '<p class="muted small">' + (s.slv_src === "step1" ? "Judged by step 1 in its scene catalog." : "Provisional, computed by HQ until step 1 judges this room.") + "</p>" +
        (s.l3c ? '<p class="small"><b>L3 checks so far</b> (step 1, 11-23): robot reach ' + s.l3c.reach[2] + " of " + s.l3c.reach[1] + " operation points tested" +
          (s.l3c.reach[3] ? " (fume hoods " + s.l3c.reach[4] + " of " + s.l3c.reach[3] + ")" : "") + "; door, lid and drawer swing: " + s.l3c.sweep[1] + " of " + s.l3c.sweep[0] + " joints clear" +
          (s.l3c.sweep[2].length ? " — hits: " + esc(s.l3c.sweep[2].map(function (h) { return h[0] + " " + h[1].replace(/_joint$/, "") + (h[2] ? " → " + h[2] : ""); }).join("; ")) : "") + ".</p>" : "") +
        (s.qb && s.qb[0] !== "not_a_base_lab" ? '<p class="small"><b>Quality floor</b> (your four approved rooms): ' + (s.qb[0] === "meets" ? '<span class="ok">meets it</span>' : '<span class="warn">gaps: ' + esc(s.qb[1].join("; ")) + "</span>") + "</p>" : "") +
        '<details><summary class="muted small">How scene levels are decided</summary><ol class="slvlist">' + SLV.map(function (x) { return "<li>" + slchip(x[0]) + " <b>" + esc(x[1]) + "</b> — " + esc(x[2]) + "</li>"; }).join("") + "</ol></details>") +
      buildSection(s) + paperSection(s) + shootSection(s) + laySection(s) +
      chkSection(s) +
      (s.trials ? sec("Robot tasks rehearsed in Studio (demo candidates)", trialCards(s.trials) + '<p class="muted small">CPU physics rehearsals of this room\'s G5 demo candidates. G5 passes only with the formal GPU demonstration in Isaac Sim.</p>') : "") +
      (s.prof ? '<section class="dsec" id="profsec"><h3>Room profile (for task planning)</h3><p class="muted small">Loading…</p></section>' : "") +
      accSec +
      sec("Does it move?", '<dl class="kv"><dt>Stability check</dt><dd>' + stab + "</dd><dt>Moving parts</dt><dd>" + esc(mechTxt(s) || "not counted yet") +
        "</dd><dt>Objects that can be picked up</dt><dd>" + (s.pick == null ? "not counted yet" : s.pick) + "</dd><dt>Robot</dt><dd>" + esc(s.robot || "none placed") + "</dd></dl>") +
      sec("What it can do", (s.fr && s.fr.length ? '<p class="ok"><b>Ready for</b></p>' + flist(s.fr) : (s.ready.length ? '<p class="ok"><b>Ready for:</b> ' + s.ready.map(esc).join(", ") + "</p>" : '<p class="muted">Not ready for any experiment yet.</p>')) +
        (s.fc && s.fc.length ? "<p><b>Close to</b></p>" + flist(s.fc) : (s.close.length ? "<p><b>Close to:</b></p>" + list(s.close) : "")) +
        (s.fn_no && s.fn_no.length ? "<details><summary>Not possible here (" + s.fn_no.length + ")</summary>" + flist(s.fn_no) + "</details>" : (s.no.length ? "<p><b>Not possible here:</b></p>" + list(s.no) : ""))) +
      sec("Can each instrument be operated?", opTable(s, items)) +
      sec("What is in it" + (nLib ? " (" + ops.length + " of " + nLib + " library assets operable)" : ""),
        items.length ? (ops.length ? '<p class="muted small">Operable (level L2 or higher)</p><div class="salist">' + ops.map(function (x) { return assetLine(x.id, x); }).join("") + "</div>" : "") +
          (lib.length ? '<p class="muted small">Only a surface, not stable, or not assessed</p><div class="salist">' + lib.map(function (x) { return assetLine(x.id, x); }).join("") + "</div>" : "") +
          (other.length ? '<details><summary class="muted small">Room fixtures and items not in the asset library (' + other.length + ")</summary><div class=\"salist\">" + other.map(function (x) { return assetLine(x.id, x); }).join("") + "</div></details>" : "")
        : '<p class="muted">No asset list for this scene yet.</p>') +
      sec("Used together", s.ut && s.ut.length ? s.ut.map(function (u) {
          var together = u[2].length > 1 ? u[2] : [];
          return '<p class="small"><b>' + esc(u[0]) + "</b> · " + (u[3] ? '<span class="ok">all placed together</span>' : (together.length ? together.length + " of " + u[1].length + " placed together" : "not placed together")) + "</p>" +
            '<div class="chips">' + u[1].map(function (id) { return '<span class="' + (together.indexOf(id) >= 0 || u[3] ? "togeth" : "apart") + '">' + aChip(id) + "</span>"; }).join("") + "</div>";
        }).join("") + '<p class="muted small">Groups from the 11-22 pairing rule. Highlighted = within 1.5 m of each other in this room (step1\'s check).</p>' : "") +
      sec("Status", "<p>" + esc(s.summary) + "</p>") +
      sec("Appearance", s.appearance ? "<p>" + esc(s.appearance) + "</p>" : "");
  }
  // one row per instrument placed in the room: is it operable, which of its moving parts were shown to work, which
  // parts it has by function, whether its lid comes off, and a button that finds it in the 3D room
  function opTable(s, items) {
    var seen = {}, rows = items.filter(function (x) { var a = byA[x.id]; if (!a || a.cls !== "Instruments" || seen[x.id]) return false; seen[x.id] = 1; return true; });
    if (!rows.length) return "";
    var order = { ok: 0, part: 1, no: 2, fixture: 3 };
    rows.sort(function (x, y) { return order[opStatus(byA[x.id])[0]] - order[opStatus(byA[y.id])[0]] || byA[x.id].name.localeCompare(byA[y.id].name); });
    var n = { ok: 0, part: 0, no: 0, fixture: 0 }; rows.forEach(function (x) { n[opStatus(byA[x.id])[0]]++; });
    return '<p class="small"><span class="opdot" style="background:#2f9e44"></span>' + n.ok + ' operable · <span class="opdot" style="background:#f08c00"></span>' + n.part +
      ' move but not shown to work · <span class="opdot" style="background:#e03131"></span>' + n.no + " not operable" + (s.room ? ' · in the 3D view choose <b>Operable?</b> to see them coloured' : "") + "</p>" +
      '<div class="optable"><div class="oprow ophead"><span>Instrument</span><span>Level</span><span>Moving parts shown to work (F1 test)</span><span>Parts by function</span><span></span></div>' +
      rows.map(function (x) {
        var a = byA[x.id], st = opStatus(a);
        return '<div class="oprow"><span><i class="opdot" style="background:' + st[1] + '"></i><a href="#assets/' + encodeURIComponent(a.id) + '">' + esc(a.name) + "</a></span><span>" + lchip(a.lv) + "</span><span>" +
          (a.fj && a.fj[0] ? a.fj[1] + " of " + a.fj[0] : '<span class="muted">none tested</span>') + "</span><span>" + (a.ar_n ? a.ar_n + " working part" + (a.ar_n === 1 ? "" : "s") : '<span class="muted">none</span>') +
          (a.lid ? ' · lid ' + esc(a.lid[0][1] === "same" ? "fused" : a.lid[0][1] === "free" ? "comes off" : a.lid[0][1]) : "") + "</span><span>" +
          (s.room ? '<button type="button" class="tgl" data-find="' + esc(a.id) + '">Find in 3D</button>' : "") + "</span></div>";
      }).join("") + "</div>" +
      '<p class="muted small">Operable = level L2 or higher: collision body, and for instruments at least one moving part opened in F1\'s physics test. Whether the robot can reach and use each one is checked per room by step 1 (acceptance G5).</p>';
  }
  function fillProfile(s) {
    fetch(new URL(s.prof, document.baseURI).href).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (p) {
      var el = $("#profsec"); if (!el || !p) return;
      var vc = function (ops) { var n = {}; ops.forEach(function (o) { n[o[2]] = (n[o[2]] || 0) + 1; }); return Object.keys(n).map(function (k) { return opv(k) + " " + n[k]; }).join(" "); };
      var fit = p.stations.filter(function (x) { return x.robot && x.robot.chassis_fits !== false; }).length;
      el.innerHTML = "<h3>Room profile (for task planning)</h3>" +
        '<p><b>' + esc(p.type) + "</b> · functions: " + esc(p.functions.join(", ")) + "</p>" +
        '<p class="small">' + p.stations.length + " stations (" + fit + " where a mobile base fits) · " + p.instruments.length + " instruments · " + p.experiments.length + " experiments · safety: " +
          esc(Object.keys(p.safety).map(function (k) { return k.replace(/_/g, " ") + " " + p.safety[k]; }).join(", ")) + "</p>" +
        (p.interference.length ? '<div class="small"><b>Interference and access</b><ul>' + p.interference.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></div>" : "") +
        (p.proposals && p.proposals.length ? '<div class="small propbox"><b>Layout proposals, waiting for your approval</b> (where a mobile robot cannot reach a station)<ul>' +
          p.proposals.map(function (x) { return "<li><b>" + esc(x[0]) + "</b>: " + esc(x[1]) + "</li>"; }).join("") + '</ul><span class="muted">Nothing changes until you approve. Tell HQ "approve the layout proposals" (or which ones).</span></div>' : "") +
        "<details><summary><b>Stations</b> (" + p.stations.length + ')</summary><div class="optable">' + p.stations.map(function (x) {
          var r = x.robot || {};
          return '<div class="oprow prow"><span><b>' + esc(x.id) + "</b></span><span>" + esc(r.kind || "") + "</span><span>" + (r.chassis_fits === false ? '<span class="warn">base does not fit (' + esc(String(r.clearance_m)) + " m)</span>" : r.kind ? '<span class="ok">fits</span>' : "") +
            "</span><span>" + esc(x.inst.join(", ")) + "</span></div>";
        }).join("") + "</div></details>" +
        "<details><summary><b>Instruments and their operations</b> (" + p.instruments.length + ')</summary><ul class="oplist">' + p.instruments.map(function (x) {
          var a = byA[x.id];
          return "<li><b>" + (a ? '<a href="#assets/' + encodeURIComponent(x.id) + '">' + esc(a.name) + "</a>" : esc(x.id)) + "</b> <span class=\"muted small\">@ " + esc(x.st) + "</span> " + vc(x.ops) + '<div class="small muted">' + esc(x.role) + "</div></li>";
        }).join("") + "</ul></details>" +
        "<details><summary><b>Experiments</b> (" + p.experiments.length + ')</summary><ul>' + p.experiments.map(function (x) {
          return "<li>" + esc(x.t) + ' <span class="muted small">(' + esc(x.pre || "") + ")</span>" + (x.miss.length ? '<div class="small muted">Missing: ' + esc(x.miss.join("; ")) + "</div>" : "") + "</li>";
        }).join("") + "</ul></details>" +
        '<p class="muted small">Machine-readable profile by step 1 (ROOM_PROFILES v1), built from today\'s scene measurements and F1\'s instrument operation profiles; the task planner reads the same file. Stand-points are a geometric pre-check; reach per operation point (IK) and door-swing checks come next.</p>';
    });
  }
  function bindScene(s) {
    if (!s) return;
    if (s.prof) fillProfile(s);
    var big = $("#sbig");
    dbody.querySelectorAll("[data-find]").forEach(function (b) { b.addEventListener("click", function () {
      var id = b.getAttribute("data-find"), box = $("#smedia");
      if (box) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (viewer && viewer.selectId) { if (viewer.selectId(id)) viewer.focus(); return; }
      pendingFind = id; var r3 = $("#room3d"); if (r3 && !r3.hidden) r3.click();
    }); });
    dbody.querySelectorAll("[data-img]").forEach(function (b) { b.addEventListener("click", function () {
      var im = (s.imgs || [])[+b.getAttribute("data-img")]; if (!im || !big) return;
      stopViewer(); var box = $("#smedia"); box.classList.remove("live"); big.hidden = false; big.src = im.src; var cap = $("#scap"); if (cap) cap.textContent = im.cap || "";
      if (b.classList.contains("linkbtn")) box.scrollIntoView({ block: "nearest", behavior: "smooth" }); var r = $("#room3d"); if (r) r.hidden = false; var bar = $("#v3dbar"); if (bar) bar.hidden = true;
    }); });
    var btn = $("#room3d"); if (!btn) return;
    btn.addEventListener("click", function () {
      var box = $("#smedia"), st = $("#v3dstat"), bar = $("#v3dbar"), pick = $("#pick");
      btn.hidden = true; st.textContent = "Loading the room…";
      import(new URL("assets/viewer3d.js" + (window.OL_BUILD ? "?v=" + window.OL_BUILD : ""), document.baseURI).href).then(function (m) {
        stopViewer();
        viewer = window.__olViewer = m.mountRoom(box, new URL(s.room, document.baseURI).href, function (msg) {
          st.textContent = msg;
          if (!msg) { box.classList.add("live"); if (big) big.hidden = true; bar.hidden = false; if (pendingFind && viewer && viewer.selectId(pendingFind)) { viewer.focus(); } pendingFind = null; }
        }, function (hit) {
          var card = $("#sinfo"); if (card) card.remove();
          if (!hit) return;
          if (hit.robot) {
            var rdiv = document.createElement("div"); rdiv.className = "sinfo"; rdiv.id = "sinfo";
            rdiv.innerHTML = '<button type="button" class="sx" data-si="close" aria-label="Close">✕</button><b>Robot: ' + esc(ROBOTNAME[hit.robot.model] || hit.robot.model) + "</b>" +
              '<div class="muted small">' + esc(String(hit.id).replace(/^robot:/, "")) + " · " + (hit.robot.kind === "fixed" ? "fixed on its stand" : "mobile base") + (hit.robot.reach ? " · arm reach " + hit.robot.reach + " m" : "") + "</div>" +
              '<div class="small muted">Simplified model for viewing (step 1, at most 30,000 triangles), placed and posed as in the simulation scene.</div>';
            box.appendChild(rdiv);
            rdiv.addEventListener("click", function (e) { if (e.target.closest('[data-si="close"]')) { viewer.clearSelection(); rdiv.remove(); } });
            return;
          }
          var a = byA[hit.id], nm = a ? a.name : String(hit.name || hit.id).replace(/^unknown:/, "").replace(/_/g, " ");  // room.json names the extra items
          var div = document.createElement("div"); div.className = "sinfo"; div.id = "sinfo";
          div.innerHTML = '<button type="button" class="sx" data-si="close" aria-label="Close">✕</button><b>' + esc(nm) + "</b>" +
            (a ? '<div class="sim">' + lchip(a.lv) + gpill(a.grade) + srcTag(a.src) + '</div><div class="muted small">' + esc(a.sub) + " · " + esc(a.lv_why || "") + "</div>" +
              (a.fj && a.fj[0] ? '<div class="small">Moving parts: ' + a.fj[1] + " of " + a.fj[0] + " opened fully in F1's test</div>" : "") +
              (a.col_n != null ? '<div class="small">Collision: ' + a.col_n + " shape" + (a.col_n === 1 ? "" : "s") + (a.parts ? " · " + a.parts + " rigid bod" + (a.parts === 1 ? "y" : "ies") : "") + "</div>" : "") +
              '<div class="small"><i class="opdot" style="background:' + opStatus(a)[1] + '"></i>' + esc(opStatus(a)[2]) + "</div>" +
              (a.lid ? '<div class="small">Lid: ' + a.lid.map(function (l) { return esc(LIDTXT[l[1]] || l[1]); }).filter(function (x, i, r) { return r.indexOf(x) === i; }).join("; ") + "</div>" : "")
              : '<div class="muted small">Not in the asset library (room fixture or extra item).</div>') +
            '<div class="sbtns"><button type="button" class="tgl" data-si="iso" aria-pressed="false">Show only this</button>' +
            (a && a.col ? '<button type="button" class="tgl" data-si="col" aria-pressed="false">Its collision</button>' : "") +
            (a && a.jm ? '<button type="button" class="tgl" data-si="jm" aria-pressed="false">Moving parts</button>' : "") +
            (a && a.ar_n ? '<button type="button" class="tgl" data-si="ops" aria-pressed="false">Operate (' + a.ar_n + ")</button>" : "") +
            '<button type="button" class="tgl" data-si="focus">Focus</button>' + (a ? '<a class="tgl" href="#assets/' + encodeURIComponent(hit.id) + '">Details →</a>' : "") + "</div>" +
            '<div class="sfun" hidden></div>';
          box.appendChild(div);
          div.addEventListener("click", function (e) {
            var b = e.target.closest("[data-si]"); if (!b || !viewer) return;
            var k = b.getAttribute("data-si"), on = b.getAttribute("aria-pressed") !== "true";
            if (k === "close") { viewer.clearSelection(); div.remove(); return; }
            if (k === "focus") { viewer.focus(); return; }
            b.setAttribute("aria-pressed", String(on));
            if (k === "iso") viewer.isolate(on);
            if (k === "col") viewer.selCollision(on);
            if (k === "jm") viewer.selJoints(a.jm, on);
            if (k === "ops") {
              var pan = div.querySelector(".sfun"); pan.hidden = !on;
              if (on && !pan.innerHTML) getArtic(a).then(function (ar) {
                if (!ar) { pan.textContent = "No moving-part data for this asset."; return; }
                pan.innerHTML = functionsHtml(ar, a);
                bindFunctions(pan, ar, a, { open: function (i, o2) { if (viewer) viewer.selSet(ar, i, o2); }, highlight: function (i) { return viewer ? viewer.selHighlight(ar, i) : 0; } });
              });
            }
          });
        });
        bar.addEventListener("click", function (e) {
          var rb = e.target.closest("[data-robots]");
          if (rb && viewer && viewer.setRobots) { var on = rb.getAttribute("aria-pressed") !== "true"; rb.setAttribute("aria-pressed", String(on)); viewer.setRobots(on); return; }
          var b = e.target.closest("[data-cut],[data-rm],[data-cb]"); if (!b || !viewer) return;
          var attr = b.hasAttribute("data-cut") ? "data-cut" : b.hasAttribute("data-rm") ? "data-rm" : "data-cb";
          bar.querySelectorAll("[" + attr + "]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          if (attr === "data-cut") viewer.setCut(b.getAttribute("data-cut") === "1");
          else if (attr === "data-cb") viewer.colourBy(b.getAttribute("data-cb"));
          else {
            var mode = b.getAttribute("data-rm"), cby = bar.querySelector(".cby"), ol = $("#oplegend");
            var al = $("#autolegend");
            if (cby) cby.hidden = !(mode === "both" || mode === "col"); if (ol) ol.hidden = mode !== "op"; if (al) al.hidden = mode !== "auto";
            if (mode === "op") viewer.setOpColours(opMap(s));
            if (mode === "auto") { var am = {}; (s.build.auto_ids || []).forEach(function (id) { am[id] = 0x12b886; }); viewer.setOpColours(am); viewer.setMode("op"); return; }
            viewer.setMode(mode);
          }
        });
      }).catch(function () { st.textContent = "3D viewing is not supported in this browser."; });
    });
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
  var drawer = $("#drawer"), dbody = $("#dbody"), lastFocus = null, viewer = null;
  function stopViewer() { exitFull(); if (viewer) { try { viewer.dispose(); } catch (e) { /* already gone */ } viewer = null; } }
  // which parts move with each joint (HQ export from the asset's USD), fetched when a 3D view needs it
  var articCache = {};
  function getArtic(a) {
    if (!a || !a.ar) return Promise.resolve(null);
    if (!articCache[a.id]) articCache[a.id] = fetch(new URL(a.ar, document.baseURI).href).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return articCache[a.id];
  }
  // readable part names from joint or mesh names: "Oven065_Button001_joint" → "Button 1", "door_left_joint" → "Door left"
  function jname(n) {
    var t = String(n).replace(/_(joint|slide|hinge)$/i, "");
    var parts = t.split("_");
    if (parts.length > 1 && /^[A-Za-z]+\d{2,}$/.test(parts[0])) parts.shift();          // drop an asset prefix such as Oven065
    t = parts.join(" ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\bbtn\b/gi, "button").replace(/([A-Za-z])0*(\d+)\b/g, "$1 $2").replace(/\s+/g, " ").trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : String(n);
  }
  // moving parts grouped by what they are for (until F1's instrument operation profiles name each operation)
  var FGROUPS = [
    ["control", "Press & switch", /button|switch|key|power|start|stop|trigger|toggle|pedal|touch|mains/i],
    ["adjust", "Turn & adjust (knobs, valves, latches, clamps)", /knob|dial|valve|clamp|lever|screw|tighten|lock|latch|thumb|regulat/i],
    ["access", "Open & close (doors, lids, drawers)", /door|lid|hatch|cover|flap|window|sash|drawer|tray|gate|cap|shield|hood|panel|bezel/i],
    ["sample", "Sample holders & loading", /rack|holder|slot|carrier|cuvette|tube|plate|well|sample|probe|needle|syringe|magazine|carousel|cassette/i],
    ["mech", "Mechanisms (rotors, stages, arms, pumps)", /rotor|spindle|arm|stage|shaker|platform|head|carriage|plunger|piston|pump|drive|motor|wheel|slide|press|lift|elevat|sunwheel|^[xyz]_|_[xyz]_/i]];
  var NONFUNC = /foot|feet|level|caster|wheel_base|_height$/i;
  function fgroup(name) { for (var i = 0; i < FGROUPS.length; i++) if (FGROUPS[i][2].test(name)) return FGROUPS[i][0]; return "other"; }
  function jfull(j) {
    if (j.free) return j.type === "revolute" ? 90 : 0;
    var lo = j.lo == null ? 0 : j.lo, hi = j.hi == null ? 0 : j.hi; return Math.abs(hi) >= Math.abs(lo) ? hi : lo;
  }
  function jfunc(j) { var t = Math.abs(jfull(j)); return !j.loop && j.links.length > 0 && !NONFUNC.test(j.name) && (j.type === "revolute" ? t >= 3 : t >= 0.004); }
  function groupIdx(ar, g) { return ar.joints.map(function (j, i) { return i; }).filter(function (i) { return jfunc(ar.joints[i]) && fgroup(ar.joints[i].name) === g; }); }
  // F1's per-joint physics test, from the joint markers: open / partly / none / untested
  var JST = { formal: ["#0b5d2e", "confirmed in a formal contact-probe run"], open: ["#1f9d55", "opened fully in F1's physics test"], partly: ["#f08c00", "moved only partly in F1's test"], none: ["#d6336c", "did not move in F1's test"], untested: ["#8a94a6", "not tested by F1 yet"] };
  function jstatus(a, name) { var r = (a && a.jm || []).filter(function (x) { return x[0] === name; })[0]; return r ? r[4] : "untested"; }
  function jdesc(a, j) {
    var t = jfull(j), st = JST[jstatus(a, j.name)];
    return jname(j.name) + ": " + (j.type === "revolute" ? "hinge, " + (j.free ? "turns freely" : "0 → " + Math.round(t) + "°") : "slide, 0 → " + Math.round(t * 1000) + " mm") + " · " + st[1];
  }
  function functionsHtml(ar, a) {
    var groups = FGROUPS.map(function (g) { return [g[0], g[1]]; }).concat([["other", "Other moving parts"]]);
    var out = groups.map(function (g) {
      var idx = groupIdx(ar, g[0]); if (!idx.length) return "";
      return '<div class="fg"><div class="fgh"><b>' + esc(g[1]) + "</b>" + (idx.length > 1 ? '<button type="button" class="jchip fgall" data-fg="' + g[0] + '" aria-pressed="false">all ' + idx.length + "</button>" : "") + "</div><div class=\"fgc\">" +
        idx.slice(0, 40).map(function (i) {
          var j = ar.joints[i];
          return '<button type="button" class="jchip" data-j="' + i + '" aria-pressed="false" title="' + esc(jdesc(a, j)) + '"><i class="jst" style="background:' + JST[jstatus(a, j.name)][0] + '"></i>' + esc(jname(j.name)) + "</button>";
        }).join("") + "</div></div>";
    }).join("");
    if (!out) return '<p class="muted small">No working moving parts.</p>';
    return '<div class="fhead"><label class="small"><input type="checkbox" data-one checked> One part at a time</label><button type="button" class="jchip" data-reset>Close all</button></div>' +
      '<div class="fgroups">' + out + '</div><div class="fstat small" aria-live="polite">Point at a part to see it highlighted; click to operate it.</div>' +
      '<div class="jkey small"><span><i class="jst" style="background:#0b5d2e"></i>formally confirmed</span><span><i class="jst" style="background:#1f9d55"></i>works in F1 test</span><span><i class="jst" style="background:#f08c00"></i>partly</span><span><i class="jst" style="background:#d6336c"></i>no motion</span><span><i class="jst" style="background:#8a94a6"></i>untested</span></div>';
  }
  // ---- automated instruments: instrument function interface (IFI, OL-12) ----
  var AUTOTXT = { agent_call: "Operated by calling its functions (an agent drives its internal mechanism)", external_robot: "Operated directly by the robot (doors, lids, keys)",
    agent_call_axes_missing: "Automated, but the asset lacks the axes its functions need", agent_call_process_only: "Automated process (rotor or pump only)" };
  var POSKIND = { park: "Park", slot: "Deck slots", well: "Wells", handoff: "Hand-off points", station: "Stations" };
  function fillIfi(a) {
    Promise.all([fetch(new URL(a.ifi, document.baseURI).href).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }), getArtic(a)]).then(function (r) {
      var d = r[0], ar = r[1], el = $("#ifisec"); if (!el || !d) return;
      var jidx = function (name) { return ar ? ar.joints.map(function (j) { return j.name; }).indexOf(name) : -1; };
      var fmt = function (v) { return v == null ? "—" : (Math.round(v * 1000) / 1000).toString(); };
      var byk = {}; d.pos.forEach(function (p) { (byk[p.kind] = byk[p.kind] || []).push(p); });
      el.innerHTML = "<h3>Automated functions an agent can call</h3>" +
        "<p>" + esc(AUTOTXT[a.auto && a.auto[0]] || "Operated by calling its functions") + ". " + d.fun.length + " functions, " + d.pos.length + " named positions (" + d.val.reachable + " reachable), " + d.handoffs + " hand-off points · " +
          '<span class="muted small">' + esc(d.status === "cpu_kinematic_validated" ? "checked in CPU kinematics (all positions, collision with the housing and deck)" : "draft") + "</span></p>" +
        '<h4 class="opcat">Moving axes</h4><div class="optbl">' + d.mech.map(function (m) {
          return '<div class="oprow2 axrow"><span><code>' + esc(m.id) + "</code>" + (m.virtual ? ' <span class="muted small">virtual</span>' : "") + "</span><span>" + esc(m.type) + ", travel " + fmt(m.travel && m.travel.lower) + " – " + fmt(m.travel && m.travel.upper) + " " + esc(m.unit || "") +
            ", home " + fmt(m.home) + '</span><span class="small muted">speed ' + fmt(m.speed) + ", accel " + fmt(m.accel) + "</span><span class=\"small muted\">" + esc(m.src ? "default (no source)" : "") + "</span></div>";
        }).join("") + "</div>" +
        '<h4 class="opcat">Functions</h4><div class="optbl">' + d.fun.map(function (f) {
          return '<div class="oprow2 fnrow"><span><code>' + esc(f.id) + "</code></span><span>" + esc(f.label) +
            '<div class="small muted">' + f.params.map(function (p) { return esc(p[0]) + (p[4] ? " (" + esc(p[4].slice(0, 6).join("/")) + (p[4].length > 6 ? "…" : "") + ")" : p[2] ? " [" + esc(p[2]) + "]" : "") + (p[3] != null ? " = " + esc(String(p[3])) : ""); }).join(", ") + "</div>" +
            (f.pre.length ? '<div class="small muted">Needs: ' + esc(f.pre.join("; ")) + "</div>" : "") + "</span>" +
            '<span class="small muted">' + esc(f.avail === "implemented_by_runtime" ? "works in the instrument program" : (f.avail || "").replace(/_/g, " ")) + "</span>" +
            '<span class="small">' + studioLink("#asset=" + encodeURIComponent(a.id) + "&op=" + encodeURIComponent((f.iop && f.iop[0]) || f.id), "Studio") + "</span></div>";
        }).join("") + "</div>" +
        '<h4 class="opcat">Named positions</h4><p class="small muted">Click a position to drive the axes there in the 3D view above.</p>' +
        Object.keys(byk).map(function (k) {
          var xs = byk[k];
          return '<details class="posd"' + (k !== "well" ? " open" : "") + "><summary>" + esc(POSKIND[k] || k) + " (" + xs.filter(function (p) { return p.ok; }).length + " of " + xs.length + ' reachable)</summary><div class="fgc">' +
            xs.slice(0, 120).map(function (p) { return '<button type="button" class="jchip" data-pos="' + esc(p.id) + '" title="' + esc(Object.keys(p.t).map(function (k2) { return k2 + " = " + fmt(p.t[k2]); }).join(", ")) + '">' + (p.ok ? "" : "✗ ") + esc(p.id.replace(/^(well|slot|station|park|handoff)\./, "")) + "</button>"; }).join("") +
            (xs.length > 120 ? '<span class="muted small">+' + (xs.length - 120) + " more</span>" : "") + "</div></details>";
        }).join("") +
        (d.rules && d.rules.length ? "<details><summary><b>How it was checked</b> (" + d.rules.length + " collision rules, " + (d.ctrls || []).length + ' negative tests)</summary><ul class="small">' +
          d.rules.map(function (r) { return "<li><b>" + esc(r[0].replace(/_/g, " ")) + "</b> <span class=\"muted\">(" + esc(r[1].replace(/_/g, " ")) + (r[4] != null ? ", applied " + r[4] : "") + ")</span>: " + esc(r[2]) + ' <span class="muted">— ' + esc(r[3]) + "</span></li>"; }).join("") +
          (d.ctrls || []).map(function (c) { return "<li>" + (c[2] ? "✓" : "✗") + " negative test <b>" + esc(c[0].replace(/_/g, " ")) + "</b>: " + esc(c[1]) + "</li>"; }).join("") + "</ul></details>" : "") +
        (d.plans || []).map(function (P) {
          var c = P.check || {}, mins = c.s ? Math.round(c.s / 60) : null;
          return '<h4 class="opcat">Planned use in an experiment</h4><div class="planbox"><p><b>' + esc(P.step) + "</b></p>" +
            (c.ok != null ? '<p class="small">' + (c.ok ? '<span class="ok">✓ Runs end to end in the CPU kinematic check</span>' : '<span class="warn">✗ Does not run end to end yet</span>') +
              (c.trips ? " · " + c.trips + " pipetting trips" : "") + (c.tips ? ", " + c.tips + " tips" : "") + (c.col != null ? ", " + c.col + " collisions" : "") + (mins ? ", about " + mins + " minutes" : "") + "</p>" : "") +
            '<p class="small"><b>Deck:</b> ' + P.deck.map(function (x) { return "<code>" + esc(x[0]) + "</code> " + esc(x[1]); }).join(" · ") + "</p>" +
            '<ol class="small planseq">' + P.seq.map(function (x) { return "<li><code>" + esc(x[1]) + "</code>" + (x[4] ? " · " + x[4] + " trips" : "") + (x[2] ? ' <span class="muted">' + esc(x[2]) + "</span>" : "") +
              (x[3] && x[3] !== "可以" ? ' <span class="warn small">' + esc(x[3]) + "</span>" : ' <span class="ok small">ready</span>') + "</li>"; }).join("") + "</ol>" +
            (P.cannot.length ? '<p class="small"><b>Not possible yet</b></p><ul class="small">' + P.cannot.map(function (x) { return "<li>" + (x[3] ? '<span class="warn">blocking</span> ' : "") + "<b>" + esc(x[0]) + "</b> — " + esc(x[1]) + ' <span class="muted">(' + esc(x[2]) + ")</span></li>"; }).join("") + "</ul>" : "") +
            '<p class="muted small">' + esc(P.scope) + " · " + esc(P.at) + "</p></div>";
        }).join("") +
        (d.repairs && d.repairs.length ? "<details><summary><b>Repairs requested from F1</b> (" + d.repairs.length + ')</summary><ul class="small">' + d.repairs.map(function (x) {
          return "<li><b>" + esc(x[0]) + "</b> " + esc(x[1]) + (x[3] ? ' <div class="muted">For the titration: ' + esc(x[3]) + "</div>" : "") + "</li>"; }).join("") + "</ul></details>" : "") +
        (d.sugg.length || d.lim.length ? "<details><summary><b>Findings and limitations</b> (" + (d.sugg.length + d.lim.length) + ")</summary><ul>" + d.sugg.concat(d.lim).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul></details>" : "") +
        '<p class="muted small">From the automated-instrument agent\'s function interface (OL-12). Speeds marked default come from engineering defaults, not the maker. Positions are checked in CPU kinematics, not yet in Isaac Sim.</p>';
      el.addEventListener("click", function (e) {
        var b = e.target.closest("[data-pos]"); if (!b || !viewer || !viewer.setJointValue) return;
        var p = d.pos.filter(function (x) { return x.id === b.getAttribute("data-pos"); })[0]; if (!p) return;
        var moved = 0;
        d.mech.forEach(function (m) { if (m.virtual || p.t[m.id] == null) return; var i = jidx(m.joint); if (i >= 0) { viewer.setJointValue(i, p.t[m.id]); moved++; } });
        el.querySelectorAll("[data-pos]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var box = $("#amedia"); if (box) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
        if (!moved) b.title = "Its axes were not found in the web model";
      });
    });
  }
  // ---- F1 instrument operation profiles (IOP v1) ----
  var iopCache = {};
  function getIop(a) {
    if (!a || !a.iop) return Promise.resolve(null);
    if (!iopCache[a.id]) iopCache[a.id] = fetch(new URL(a.iop, document.baseURI).href).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return iopCache[a.id];
  }
  var OPCAT = [["access", "Open & close"], ["load_unload", "Load & unload"], ["control", "Control & set"], ["adjust", "Adjust"], ["observe", "Read & observe"], ["maintenance", "Maintain"], ["other", "Other"]];
  var OPV = { FUNCTIONAL: ["#1f9d55", "works"], PARTIAL: ["#f08c00", "partly shown"], DECORATIVE: ["#8e44ad", "decorative: moves, no effect"], MISSING: ["#d6336c", "part missing"], SOFTWARE_ONLY: ["#2f7fd8", "software interface only"] };
  var OPI = { physical_contact: "by hand", physical_button: "button", physical_knob: "knob", touchscreen: "touch screen", software_interface: "software", display: "display", unverified_interface: "interface unverified", unverified_readout: "readout unverified", scene_configuration_only: "scene setup" };
  function opv(v) { var x = OPV[v] || ["#8a94a6", v || "?"]; return '<span class="opv" style="--c:' + x[0] + '">' + esc(x[1]) + "</span>"; }
  function jointIdx(ar, names) { var out = []; if (!ar) return out; ar.joints.forEach(function (j, i) { if (names.indexOf(j.name) >= 0) out.push(i); }); return out; }
  // ---- Studio (debug console). Its address stays in this browser only (the site carries no host names). ----
  function studioLink(hash, label) { return hash ? '<a href="#" class="studiolink" data-studio="' + esc(hash) + '">' + esc(label || "Open in Studio") + " ↗</a>" : ""; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-studio]"); if (!a) return; e.preventDefault();
    var base = ""; try { base = localStorage.getItem("olStudioBase") || ""; } catch (x) { /* storage blocked */ }
    if (!base) {
      base = (window.prompt("Address of the Studio debug console (for example …/studio/). It is kept only in this browser.") || "").trim();
      if (!base) return; if (!/\/$/.test(base)) base += "/"; try { localStorage.setItem("olStudioBase", base); } catch (x) { /* ignore */ }
    }
    window.open(base + a.getAttribute("data-studio"), "_blank", "noopener");
  });
  // Studio whole-room checkups: failure groups are HQ's reading of Studio's measured travel and hold
  var CHKCLS = {
    multiturn: ["Needs several turns", "Studio's rehearsal stops after about three quarters of a turn, so knobs and levelling feet rated for 2–10 turns cannot reach 85 % of their range. A limit of the rehearsal, not a fault in the model.", "Studio: turn multi-turn parts with repeated grips"],
    spin: ["Turns freely, no end stop", "Rotors, screws and endless knobs have no end stop, so the rule “reach 85 % of the range” cannot be met.", "Studio: judge free-turning parts by the turns made"],
    nostop: ["Lid or door without an end stop", "In our joint data this lid or door can swing without limit, so no rehearsal can judge it. A fault in the model, not counted as a rehearsal failure; Studio re-tests once F1 fixes it.", "F1: give these hinges their real opening angle"],
    hold: ["Did not stay at the target", "The part reached its target but did not hold it for the 10 frames required.", "Studio and F1: check the part's stop and damping"],
    short: ["Moved only part of its range", "The part was driven but stopped short of 85 % of its range.", "Check the part in Studio"],
    other: ["Other", "", "Check in Studio"]
  };
  var ROBOTNAME = { fr3_fixed: "Franka FR3 on a fixed stand", fr3_fixed_r2cell: "Franka FR3, fixed cell (R2)", fr3_fixed_r3cell: "Franka FR3, fixed cell (R3)",
    fr3_fixed_titrationcell: "Franka FR3, titration cell", fr3_arm: "Franka FR3 arm", mobile_umr_dual: "Dual-arm mobile robot (UMR)", mobile_single: "Single-arm mobile robot", mobile_driven: "Mobile base with arm" };
  // step1's layout rules (LAYOUT_RULES_v1): per-room checks, plan image, and any proposed layout layer
  function layList(checks) {
    return '<div class="optbl">' + checks.map(function (c) {
      var ok = c[1] === "pass";
      return '<div class="oprow2 layrow"><span><span class="opst" style="--c:' + (ok ? "#1f9d55" : c[1] === "fail" ? "#d6336c" : "#8a8f98") + '">' + (ok ? "✓ Pass" : c[1] === "fail" ? "✗ Fail" : esc(c[1])) + "</span></span><span>" +
        esc(LAYNAME[c[0]] || c[0]) + (c[2].length ? '<div class="muted small">' + c[2].map(esc).join("; ") + (c[3] > c[2].length ? " … (" + c[3] + " in all)" : "") + "</div>" : "") + "</span></div>";
    }).join("") + "</div>";
  }
  var LAYNAME = { A1_main_aisle: "Main aisle at least 1.2 m", A2_secondary_aisle: "Secondary aisles at least 0.9 m", W1_station_work_zone: "0.9 m work zone in front of each bench",
    H1_hood_against_wall: "Fume hood backed against a wall", H2_hood_front_zone: "1.0 m clear in front of each fume hood", H3_hood_away_from_door: "Fume hood at least 3 m from the door",
    B1_bsc_away_from_entry: "Biosafety cabinet at least 1.52 m from the entry", B2_bsc_front_zone: "Clear zone in front of the biosafety cabinet", C1_cabinets_against_wall: "Cabinets against a wall",
    C2_cabinet_doors_open_clear: "Cabinet doors can open fully", E1_eyewash_10s: "Eyewash and shower reachable within 10 s", F1_flammables_gas_away_from_heat: "Flammables and gas at least 0.9 m from heat",
    F2_flammables_not_at_exit: "Flammables cabinet at least 1.5 m from the exit", S1_heat_instrument_service_gap: "Service gap of 0.15 m around furnaces and ovens" };
  function laySection(s) {
    var L = s.lay; if (!L) return "";
    return '<section class="dsec" id="laysec"><h3>Laboratory layout rules</h3>' +
      "<p><b>" + L.p + " of " + (L.p + L.f) + " checks pass</b> in the current layout" + (L.na.length ? ' <span class="muted small">(not applicable: ' + esc(L.na.join("; ")) + ")</span>" : "") + "</p>" +
      (L.prop ? '<p class="propbox small"><b>Proposed new layout: ' + L.prop.p + " of " + (L.prop.p + L.prop.f) + " pass.</b> Step 1 moved fume hoods and cabinets to the walls by these rules. The room switches to it only after it passes the strict stability check (L0)" +
        (s.id.indexOf("legacy_") === 0 ? " and you approve it" : "") + ".</p>" : "") +
      (L.rearr ? '<div class="propbox small"><b>Rearrangement waiting for your decision: ' + (L.rearr.before ? L.rearr.before[0] + "/" + L.rearr.before[1] : "") + " → " + (L.rearr.after ? L.rearr.after[0] + "/" + L.rearr.after[1] : "?") + " rules pass</b>" +
        (L.rearr.l0 ? " · strict L0 " + esc(L.rearr.l0) + (L.rearr.drift_mm != null ? " (drift " + L.rearr.drift_mm + " mm)" : "") : "") + (L.rearr.carried ? " · " + L.rearr.carried + " items move with their bench" : "") +
        '<ul>' + L.rearr.moves.map(function (m) { return "<li><b>" + esc(m[0]) + "</b>: " + esc(m[1]) + "</li>"; }).join("") + "</ul>" +
        (L.rearr.checks.length ? '<details><summary>Checks after the rearrangement</summary>' + layList(L.rearr.checks) + "</details>" : "") +
        '<span class="muted">Built as a separate layout layer; the room switches only when you say so.</span></div>' : "") +
      '<div class="layplans">' + (L.plan ? '<figure><img loading="lazy" src="' + esc(L.plan) + '" alt="Layout check plan, current layout"><figcaption class="small muted">Current layout, checked</figcaption></figure>' : "") +
        (L.prop && L.prop.plan ? '<figure><img loading="lazy" src="' + esc(L.prop.plan) + '" alt="Layout check plan, proposed layout"><figcaption class="small muted">Proposed layout</figcaption></figure>' : "") + "</div>" +
      "<details" + (L.f ? " open" : "") + '><summary class="small"><b>Checks, current layout</b></summary>' + layList(L.checks) + "</details>" +
      (L.prop ? '<details><summary class="small"><b>Checks, proposed layout</b></summary>' + layList(L.prop.checks) + "</details>" : "") +
      (L.moves && L.moves.length ? '<details><summary class="small"><b>What the proposal moves</b> (' + L.moves.length + ')</summary><ul class="small">' + L.moves.map(function (m) { return "<li><b>" + esc(m[0]) + "</b>" + (m[2] != null ? " · moved " + m[2] + " m" : "") + ' <span class="muted">' + esc(m[1]) + "</span></li>"; }).join("") + "</ul></details>" : "") +
      (L.note ? '<p class="muted small">' + esc(L.note) + "</p>" : "") +
      '<p class="muted small">Rules from ADA 2010, the NIH Design Requirements Manual, NFPA 45, ANSI/ISEA Z358.1, OSHA and BMBL, checked by step 1 on a 5 cm floor grid. NFPA and ANSI texts are paywalled, so their section numbers are not confirmed; values marked as recommendations or design values are design choices, not legal minimums.</p></section>';
  }
  function shootSection(s) {
    var S = s.shoot; if (!S) return "";
    var st = S.st || {};
    return '<section class="dsec" id="shootsec"><h3>' + esc(S.title || "Photos from the simulation (shoot v1)") + "</h3>" +
      (S.vid ? '<video class="shootvid" controls preload="none" playsinline src="' + esc(S.vid) + '"' + (S.poster || S.ph.length ? ' poster="' + esc(S.poster || S.ph[0][0]) + '"' : "") + "></video>" : "") +
      (S.ph.length ? '<div class="shoot">' + S.ph.map(function (p) { return '<a href="' + esc(p[0]) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(p[1]) + '" alt="' + esc(p[2]) + '"><span>' + esc(p[2]) + "</span></a>"; }).join("") + "</div>"
        : '<p class="small">' + (S.n || 0) + " photos" + (S.video ? " and a walkthrough video" : "") + " recorded on the GPU machine; they reach this page when step 1 copies them to the shared catalog.</p>") +
      '<p class="muted small">' + esc(S.res || "Isaac Sim 5.1, RTX path tracing, 1920×1080") + (S.skip ? " · " + S.skip + " camera position" + (S.skip === 1 ? "" : "s") + " skipped (inside objects)" : "") +
        (st.video ? " · video: " + esc(st.video === "RECORDED" ? "recorded" : st.video.toLowerCase().replace(/_/g, " ")) : "") + (S.note ? " · " + esc(S.note) : "") + "</p></section>";
  }
  // scenes built from a paper: what the paper's experiment needs against what this scene has (status.json scene3d.paper, written by the builder)
  function buildSection(s) {
    var B = s.build; if (!B || !B.mode) return "";
    var li = function (a) { return "<ul>" + a.map(function (x) { return Array.isArray(x) ? "<li><b>" + esc(x[0]) + "</b> — " + esc(x[1]) + "</li>" : "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; };
    return '<section class="dsec autosec" id="buildsec"><h3>How this scene was built <span class="autob">' + esc(B.badge || "Auto-built from paper") + "</span></h3>" +
      (B.summary ? "<p>" + esc(B.summary) + "</p>" : "") +
      (B.automatic && B.automatic.length ? "<p><b>Done by the pipeline on its own</b></p>" + li(B.automatic) : "") +
      (B.refined_by_agent && B.refined_by_agent.length ? "<p><b>Refined by the agent, with the reason</b></p>" + li(B.refined_by_agent) : "") +
      (B.not_simulated && B.not_simulated.length ? "<p><b>Not simulated</b></p>" + li(B.not_simulated) : "") +
      (B.auto_ids ? '<p class="muted small">In the 3D view, <b>Auto-built?</b> colours what this build added.</p>' : "") + "</section>";
  }
  function paperSection(s) {
    var P = s.paper; if (!P) return "";
    var W = { ok: ["ok", "Yes"], part: ["part", "Partly"], no: ["no", "No"] };
    var rows = function (R) { return '<dl class="kv acc">' + R.map(function (r) { var w = W[r[1]] || ["na", r[1]]; return "<dt>" + esc(r[0]) + '</dt><dd><span class="gate ' + w[0] + '">' + esc(w[1]) + "</span> " + esc(r[2]) + "</dd>"; }).join("") + "</dl>"; };
    return '<section class="dsec" id="papersec"><h3>' + esc(P.title || "The paper's experiment in this scene") + "</h3>" + (P.intro ? "<p>" + esc(P.intro) + "</p>" : "") + rows(P.rows || []) +
      (P.ops && P.ops.length ? "<p><b>" + esc(P.ops_title || "Can each instrument be operated?") + "</b></p>" + rows(P.ops) : "") + (P.note ? '<p class="muted small">' + esc(P.note) + "</p>" : "") + "</section>";
  }
  function chkSection(s) {
    var c = s.chk; if (!c) return "";
    var groups = {}, catn = {};
    c.fails.forEach(function (f) { (groups[f[0]] = groups[f[0]] || []).push(f); });
    OPCAT.forEach(function (x) { catn[x[0]] = x[1]; });
    return '<section class="dsec" id="chksec"><h3>Whole-room check in Studio</h3>' + (
      "<p><b>" + c.p + " of " + c.t + " operations pass</b> (" + Math.round(100 * c.p / c.t) + " %) across " + c.inst + " instruments · " + esc(c.at) + "</p>" +
      (c.ver === "v2" ? '<p class="small">' + (c.pstd != null ? c.pstd + " by the standard rule" + (c.cont.length ? ", " + c.cont.length + " free-turning part" + (c.cont.length === 1 ? "" : "s") + " judged by full turns" : "") : "") +
        " · " + (c.ndef ? '<span class="warn">' + c.ndef + " model fault" + (c.ndef === 1 ? "" : "s") + " (no end stop)</span>" : "no model faults") + " · " + (c.nfail ? '<span class="warn">' + c.nfail + " rehearsal failures</span>" : "no rehearsal failures") +
        (c.v1 ? ' <span class="muted">(first run earlier on 11-23: ' + c.v1[0] + "/" + c.v1[1] + ", before Studio fixed its rules for multi-turn and free-turning parts)</span>" : "") + "</p>" : "") +
      '<div class="rckcats">' + c.cats.map(function (x) {
        return '<span class="rckcat"><span>' + esc(catn[x[0]] || x[0]) + '</span><span class="bar"><i style="width:' + (100 * x[1] / x[2]).toFixed(1) + '%"></i></span><span class="small">' + x[1] + "/" + x[2] + "</span></span>";
      }).join("") + "</div>" +
      (c.fails.length ? '<h4 class="rckh">' + (c.ver === "v2" ? "Not passing (" + c.fails.length + ")" : "Why " + c.fails.length + " failed") + "</h4>" + Object.keys(CHKCLS).filter(function (k) { return groups[k]; }).map(function (k) {
        var g = groups[k], d = CHKCLS[k];
        return '<details class="rckg"><summary><b>' + esc(d[0]) + "</b> · " + g.length + ' <span class="muted small">→ ' + esc(d[2]) + "</span></summary>" + (d[1] ? '<p class="small muted">' + esc(d[1]) + "</p>" : "") +
          '<div class="optbl">' + g.map(function (f) {
            var a = byA[f[2]];
            return '<div class="oprow2 rckrow"><span>' + (a ? '<a href="#assets/' + encodeURIComponent(f[2]) + '">' + esc(a.name) + "</a>" : esc(f[1])) + '<div class="muted small">' + esc(f[1]) + "</div></span><span>" + esc(f[3]) +
              '<div class="muted small">' + esc(f[5]) + "</div>" + (f[8] ? '<a href="' + esc(f[8]) + '" target="_blank" rel="noopener"><img class="rckfilm" loading="lazy" alt="filmstrip" src="' + esc(f[8]) + '"></a>' : "") + "</span><span>" + studioLink(f[6], "Replay in Studio") + "</span><span>" +
              (s.room && a ? '<button type="button" class="tgl" data-find="' + esc(f[2]) + '">Find in 3D</button>' : "") + "</span></div>";
          }).join("") + "</div></details>";
      }).join("") : "") +
      (c.cont && c.cont.length ? '<details class="rckg"><summary><b>Free-turning parts</b> · ' + c.cont.length + ' <span class="muted small">rotors, screws and endless knobs, passed by turning a full turn or more without sticking</span></summary><div class="optbl">' + c.cont.map(function (f) {
        var a = byA[f[1]];
        return '<div class="oprow2 rckrow"><span>' + (a ? '<a href="#assets/' + encodeURIComponent(f[1]) + '">' + esc(a.name) + "</a>" : esc(f[0])) + '<div class="muted small">' + esc(f[0]) + "</div></span><span>" + esc(f[2]) +
          (f[3] != null ? '<div class="muted small">' + Number(f[3]).toFixed(2) + " turns</div>" : "") + "</span><span>" + studioLink(f[4], "Replay in Studio") + "</span><span>" + (s.room && a ? '<button type="button" class="tgl" data-find="' + esc(f[1]) + '">Find in 3D</button>' : "") + "</span></div>";
      }).join("") + "</div></details>" : "") +
      '<details class="rckg"><summary><b>Per instrument</b> (' + c.rows.length + ')</summary><div class="optbl">' + c.rows.map(function (r) {
        var a = byA[r[1]];
        return '<div class="oprow2 rckrow"><span>' + (a ? '<a href="#assets/' + encodeURIComponent(r[1]) + '">' + esc(a.name) + "</a>" : esc(r[1])) + '</span><span class="muted small">' + esc(r[0]) +
          '</span><span><span class="opst" style="--c:' + (r[2] === r[3] ? "#1f9d55" : "#f08c00") + '">' + r[2] + "/" + r[3] + " passed</span></span><span>" +
          (s.room && a ? '<button type="button" class="tgl" data-find="' + esc(r[1]) + '">Find in 3D</button>' : "") + "</span></div>";
      }).join("") + "</div></details>" +
      '<p class="muted small">Studio drives every moving part of every instrument in this room by physical contact in CPU physics (' + esc(c.sim || "MuJoCo") + ") and checks travel, contact and hold; parts that need several turns are re-gripped. It is a rehearsal, not a formal result and not yet a robot demonstration. " +
        (c.reach ? "Studio's reach pre-check (straight-line distance of at most 0.90 m from where the room's robots stand now; not full inverse kinematics): " + c.reach[0] + " of " + c.reach[1] + " targets." : "No robot is placed in this room yet, so reach is not checked.") + "</p>") + "</section>";
  }
  function chkAsset(a) {
    var c = a.chk; if (!c) return "";
    var m = {}, keys = [];
    c[2].forEach(function (f) { var k = f[1] + "|" + f[2]; if (!m[k]) { m[k] = { f: f, rooms: {} }; keys.push(k); } var rn = byS[f[0]] ? byS[f[0]].name : f[0]; m[k].rooms[rn] = (m[k].rooms[rn] || 0) + 1; });
    return "<p><b>Whole-room checks in Studio:</b> " + c[0] + " of " + c[1] + " operation rehearsals passed in the rooms where it stands" + (keys.length ? ". Failed:" : ".") + "</p>" +
      (keys.length ? '<ul class="small">' + keys.map(function (k) {
        var x = m[k], f = x.f;
        return "<li><b>" + esc(f[1]) + "</b> — " + esc(f[2]) + ' <span class="muted">(' + esc((CHKCLS[f[3]] || CHKCLS.other)[0].toLowerCase()) + "; " + esc(Object.keys(x.rooms).map(function (r) { return r + (x.rooms[r] > 1 ? " ×" + x.rooms[r] : ""); }).join(", ")) + ")</span> " + studioLink(f[4], "Replay") + "</li>";
      }).join("") + "</ul>" : "");
  }
  function trialCards(list) {
    return '<div class="trials">' + list.map(function (t) {
      return '<div class="trial"><div class="trh"><span class="opst" style="--c:' + (t.ok ? "#1f9d55" : "#d6336c") + '">' + (t.ok ? "✓ Passed" : "✗ Failed") + "</span> <b>" + esc(t.label) + "</b>" +
        ' <span class="muted small">' + esc(t.prim) + " · " + (t.formal ? "formal" : "CPU rehearsal, not the formal demo") + "</span></div>" +
        (t.media.film ? '<img class="trfilm" loading="lazy" alt="filmstrip" src="' + esc(t.media.film) + '">' : "") +
        '<div class="small">' + t.stages.map(function (x) { return (x[1] ? "✓ " : "✗ ") + esc(x[0]); }).join(" → ") + "</div>" +
        '<div class="small muted">' + esc(t.why) + "</div>" +
        '<div class="small">' + (t.media.video ? '<a href="' + esc(t.media.video) + '" target="_blank" rel="noopener">Play the video</a> · ' : "") + studioLink(t.link) + "</div></div>";
    }).join("") + "</div>";
  }
  // one status per operation: formally confirmed beats F1's verdict
  var OPRANK = { CONFIRMED: 0, FUNCTIONAL: 1, PARTIAL: 2, SOFTWARE_ONLY: 3, DECORATIVE: 4, MISSING: 5 };
  var OPSTAT = { CONFIRMED: ["#0b5d2e", "✓ Works", "confirmed with a contact probe in a formal run"], FUNCTIONAL: ["#1f9d55", "✓ Works", "F1: the full chain works"],
    PARTIAL: ["#f08c00", "◐ Partly", "the part moves, but the effect on the experiment is not proven yet"], SOFTWARE_ONLY: ["#2f7fd8", "⌁ Software only", "done through the instrument's program interface, no physical part"],
    DECORATIVE: ["#8e44ad", "◌ Decorative", "moves, but changes nothing"], MISSING: ["#d6336c", "✗ Missing part", "the part needed for this operation is not modelled"] };
  var ZHPART = { button: "按钮", switch: "开关", knob: "旋钮", door: "门", lid: "盖", drawer: "抽屉", handle: "把手", latch: "门闩", cover: "盖", tray: "托盘", key: "按键" };
  function zhPart(raw) {
    var t = jname(raw).toLowerCase(), m = /^([a-z]+)\s*(\d*)\s*(.*)$/.exec(t);
    if (m && ZHPART[m[1]]) return ZHPART[m[1]] + (m[2] ? " " + m[2] : "") + (m[3] ? "（" + m[3] + "）" : "");
    return jname(raw);
  }
  function cleanOpLabel(o) {
    var l = String(o.l || ""), m = /^验证\s*(.+?)\s*的独立操作行程$/.exec(l);
    if (m) { var part = m[1].split(/[./]/).pop(); return (/button|key|switch/i.test(part) ? "按下 " : /knob/i.test(part) ? "转动 " : /door|lid|cover|drawer/i.test(part) ? "打开/关上 " : "操作 ") + zhPart(part); }
    if (/^mechanical\.|^[\w.]+_joint$/.test(l)) return o.j.length ? "操作 " + zhPart(o.j[0]) : l;
    return l;
  }
  function opState(o, a) {
    var conf = a.fconf ? a.fconf[2] : [];
    if (o.j.length && o.j.every(function (j) { return conf.indexOf(j) >= 0; })) return "CONFIRMED";
    return o.v || "PARTIAL";
  }
  function fillIop(a) {
    Promise.all([getIop(a), getArtic(a)]).then(function (r) {
      var d = r[0], ar = r[1], el = $("#iopsec"); if (!el) return;
      if (!d) { el.innerHTML = "<h3>How it works and what it can do</h3><p class=\"muted\">No operation profile.</p>"; return; }
      var core = {}; d.core.forEach(function (k) { core[k[1]] = 1; });
      // clean, merge duplicates, sort: category order, core first, status, name
      var rows = {}, order = OPCAT.map(function (c) { return c[0]; });
      d.ops.forEach(function (o) {
        var lab = cleanOpLabel(o), key = o.c + "|" + lab, st = opState(o, a);
        var x = rows[key] || (rows[key] = { c: o.c, l: lab, st: st, i: o.i, j: [], core: false, s: o.s, a: o.a, pre: o.pre, id: o.id });
        if (OPRANK[st] < OPRANK[x.st]) x.st = st;
        o.j.forEach(function (j) { if (x.j.indexOf(j) < 0) x.j.push(j); });
        if (core[o.id]) x.core = true;
      });
      var list = Object.keys(rows).map(function (k) { return rows[k]; });
      list.sort(function (x, y) { return (order.indexOf(x.c) < 0 ? 99 : order.indexOf(x.c)) - (order.indexOf(y.c) < 0 ? 99 : order.indexOf(y.c)) || (y.core - x.core) || (OPRANK[x.st] - OPRANK[y.st]) || x.l.localeCompare(y.l); });
      var n = {}; list.forEach(function (x) { n[x.st] = (n[x.st] || 0) + 1; });
      var CAN = { yes: ["ok", "Yes"], partial: ["part", "Partly"], no: ["no", "No"] }, c = CAN[d.can] || ["na", d.can || "unknown"];
      var phys = list.filter(function (x) { return x.j.length; }).length;
      el.innerHTML = "<h3>How it works and what it can do</h3><p>" + esc(d.purpose) + "</p>" +
        (d.labs.length || d.exps.length ? '<p class="small muted">' + (d.labs.length ? "Used in: " + esc(d.labs.join(", ").replace(/_/g, " ")) : "") + (d.exps.length ? " · Experiments: " + esc(d.exps.join("; ")) : "") + "</p>" : "") +
        '<div class="iopcan"><span class="gate ' + c[0] + '">' + esc(c[1]) + "</span> <b>Can it do its job in simulation?</b> " + esc(d.reason || "") + "</div>" +
        '<p class="small">' + list.length + " operations: " + Object.keys(OPSTAT).filter(function (k) { return n[k]; }).map(function (k) { return '<span class="opst" style="--c:' + OPSTAT[k][0] + '">' + OPSTAT[k][1] + " " + n[k] + "</span>"; }).join(" ") +
          (phys ? ' · <span class="muted">' + phys + " move a part you can try in 3D</span>" : "") + "</p>" +
        OPCAT.map(function (cat) {
          var xs = list.filter(function (x) { return x.c === cat[0]; }); if (!xs.length) return "";
          return '<h4 class="opcat">' + esc(cat[1]) + '</h4><div class="optbl">' + xs.map(function (x) {
            var idx = jointIdx(ar, x.j), stt = OPSTAT[x.st] || ["#8a94a6", x.st, ""];
            return '<div class="oprow2"><span class="opst" style="--c:' + stt[0] + '" title="' + esc(stt[2]) + '">' + esc(stt[1]) + "</span>" +
              "<span>" + (x.core ? "<b>" : "") + esc(x.l) + (x.core ? "</b>" : "") + (x.core ? ' <span class="muted small">core</span>' : "") +
                ((x.s && x.s.length) || x.a ? '<details class="opd"><summary class="small muted">how</summary><div class="small muted">' + (x.s && x.s.length ? "By hand: " + esc(x.s.join(" → ")) : "") + (x.a ? "<br>Robot: " + esc(x.a) : "") + (x.pre && x.pre.length ? "<br>Needs first: " + esc(x.pre.join(", ")) : "") + "</div></details>" : "") + "</span>" +
              '<span class="small muted">' + esc(OPI[x.i] || x.i || "") + "</span>" +
              "<span>" + (idx.length ? '<button type="button" class="jchip" data-try="' + idx.join(",") + '">Try in 3D</button>' : "") + " " + studioLink("#asset=" + encodeURIComponent(a.id) + "&op=" + encodeURIComponent(x.id), "Studio") + "</span></div>";
          }).join("") + "</div>";
        }).join("") +
        (d.gaps.length ? '<details><summary><b>What is missing</b> (' + d.gaps.length + ")</summary><ul>" + d.gaps.map(function (g) { return "<li>" + esc(g[0]) + ' <span class="muted small">fix: ' + esc(g[1]) + "</span></li>"; }).join("") + "</ul></details>" : "") +
        '<p class="muted small">Status per operation: ✓ Works = confirmed (formal contact-probe run, or F1 proved the whole chain); ◐ Partly = the part moves but its effect on the experiment is not proven; ⌁ Software only = via the instrument\'s program; ◌ Decorative = moves, changes nothing; ✗ Missing part. Source: F1\'s operation profile and the formal runs.</p>';
      el.addEventListener("click", function (e) {
        var b = e.target.closest("[data-try]"); if (!b || !viewer || !viewer.open) return;
        var idx = b.getAttribute("data-try").split(",").map(Number), on = b.getAttribute("aria-pressed") !== "true";
        el.querySelectorAll("[data-try]").forEach(function (x) { if (x !== b && x.getAttribute("aria-pressed") === "true") { x.setAttribute("aria-pressed", "false"); x.getAttribute("data-try").split(",").map(Number).forEach(function (k) { viewer.open(k, false); }); } });
        b.setAttribute("aria-pressed", String(on)); idx.forEach(function (k) { viewer.open(k, on); }); if (viewer.highlight) viewer.highlight(on ? idx[0] : null);
        var box = $("#amedia"); if (box) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    });
  }
  function opsHtml(d, ar) {
    var rows = d.ops.map(function (o) { return [o, jointIdx(ar, o.j)]; }).filter(function (x) { return x[1].length; });
    if (!rows.length) return "";
    var byc = {}; rows.forEach(function (x) { (byc[x[0].c] = byc[x[0].c] || []).push(x); });
    return OPCAT.map(function (cat) {
      var xs = byc[cat[0]]; if (!xs) return "";
      return '<div class="fg"><div class="fgh"><b>' + esc(cat[1]) + '</b></div><div class="fgc">' + xs.map(function (x) {
        return '<button type="button" class="jchip" data-js="' + x[1].join(",") + '" aria-pressed="false" title="' + esc(x[0].l + " · " + (OPV[x[0].v] || [0, x[0].v])[1] + (x[0].s.length ? " · " + x[0].s.join(" → ") : "")) + '"><i class="jst" style="background:' + (OPV[x[0].v] || ["#8a94a6"])[0] + '"></i>' + esc(x[0].l) + "</button>";
      }).join("") + "</div></div>";
    }).join("");
  }
  // ops = { open(i, on), highlight(i | null) }
  function bindFunctions(panel, ar, a, ops) {
    var stat = panel.querySelector(".fstat"), one = panel.querySelector("[data-one]");
    var press = function (i, on) { panel.querySelectorAll('[data-j="' + i + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(on)); }); };
    var openIdx = function () { return Array.prototype.map.call(panel.querySelectorAll('[data-j][aria-pressed="true"]'), function (x) { return +x.getAttribute("data-j"); }); };
    panel.addEventListener("click", function (e) {
      var tab = e.target.closest("[data-tab]");
      if (tab) { panel.querySelectorAll("[data-tab]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === tab)); }); panel.querySelectorAll("[data-pane]").forEach(function (x) { x.hidden = x.getAttribute("data-pane") !== tab.getAttribute("data-tab"); }); return; }
      var opb = e.target.closest("[data-js]");
      if (opb) {
        e.stopPropagation(); var on0 = opb.getAttribute("aria-pressed") !== "true", js = opb.getAttribute("data-js").split(",").map(Number);
        if (on0 && one && one.checked) { openIdx().forEach(function (k) { if (js.indexOf(k) < 0) { ops.open(k, false); press(k, false); } }); panel.querySelectorAll('[data-js][aria-pressed="true"]').forEach(function (x) { if (x !== opb) x.setAttribute("aria-pressed", "false"); }); }
        opb.setAttribute("aria-pressed", String(on0)); js.forEach(function (k) { ops.open(k, on0); press(k, on0); });
        stat.textContent = (on0 ? "Doing: " : "Undoing: ") + opb.title; return;
      }
      var b = e.target.closest("[data-j],[data-fg],[data-reset]"); if (!b) return; e.stopPropagation();
      if (b.hasAttribute("data-reset")) { openIdx().forEach(function (i) { ops.open(i, false); press(i, false); }); panel.querySelectorAll("[data-js]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); panel.querySelectorAll("[data-fg]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); stat.textContent = "All parts closed."; return; }
      var on = b.getAttribute("aria-pressed") !== "true";
      if (b.hasAttribute("data-j")) {
        var i = +b.getAttribute("data-j");
        if (on && one && one.checked) openIdx().forEach(function (k) { if (k !== i) { ops.open(k, false); press(k, false); } });
        ops.open(i, on); press(i, on); stat.textContent = (on ? "Opening " : "Closing ") + jdesc(a, ar.joints[i]);
      } else {
        var idx = groupIdx(ar, b.getAttribute("data-fg")); b.setAttribute("aria-pressed", String(on));
        idx.forEach(function (k) { ops.open(k, on); press(k, on); }); stat.textContent = (on ? "Opening " : "Closing ") + idx.length + " parts together.";
      }
    });
    panel.addEventListener("mouseover", function (e) {
      var ob = e.target.closest("[data-js]"); if (ob) { ops.highlight(+ob.getAttribute("data-js").split(",")[0]); stat.textContent = ob.title; return; }
      var b = e.target.closest("[data-j]"); if (b) { var n = ops.highlight(+b.getAttribute("data-j")); stat.textContent = jdesc(a, ar.joints[+b.getAttribute("data-j")]) + (n ? "" : " · (not found in the web model)"); } });
    panel.addEventListener("mouseout", function (e) { if (e.target.closest("[data-j],[data-js]")) ops.highlight(null); });
  }
  var PART_HEX = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#86bcb6", "#8cd17d", "#d4a6c8"];
  var HOWTXT = { base: "main body", loose: "separate part, not attached", fixed: "fixed (welded) to", revolute: "hinged on", prismatic: "slides on" };
  var LIDTXT = { same: "part of the same rigid body as the vessel, so it cannot come off", free: "a separate part, not attached, so it can be lifted off",
    fixed: "a separate part but welded on with a fixed joint, so it cannot come off", hinge: "hinged, so it opens on its hinge", slide: "slides open" };
  function partsLegend(ar) {
    if (!ar || !ar.bodies || !ar.bodies.length) return '<span class="muted small">No rigid-body data.</span>';
    var main = -1;
    return '<b class="small">Rigid bodies (' + ar.bodies.length + "):</b>" + ar.bodies.slice(0, 24).map(function (b, i) {
      var how = b.how === "base" || b.how === "loose" ? (main < 0 ? (main = i, "main body") : HOWTXT.loose) : (HOWTXT[b.how] || b.how + " joint to") + (b.to ? " " + b.to.replace(/_/g, " ") : "");
      return '<span><i style="background:' + PART_HEX[i % PART_HEX.length] + '"></i>' + esc(b.name.replace(/_/g, " ")) + ' <span class="muted">' + esc(how) + "</span></span>";
    }).join("") + (ar.bodies.length > 24 ? '<span class="muted">+' + (ar.bodies.length - 24) + " more</span>" : "") +
      '<span class="muted small">Same colour = one rigid body. A cap in the bottle\'s colour is fused to it.</span>';
  }
  // can it be operated? from the readiness level (v2): L2 and up = operable as an object
  function opStatus(a) {
    if (!a) return ["fixture", "#b8bec8", "Room fixture, not in the asset library"];
    if (/^L[2-5]$/.test(a.lv)) return ["ok", "#2f9e44", "Operable (" + a.lv + ")" + (a.fj && a.fj[0] ? ": " + a.fj[1] + " of " + a.fj[0] + " moving parts opened in F1's test" : "")];
    if (a.lv === "L1") return ["part", "#f08c00", "Moves, but no part shown to work yet (L1)"];
    if (a.lv === "L1s" || a.lv === "L0") return ["no", "#e03131", "Not operable (" + (a.lv === "L1s" ? "only a surface" : "fails to load or not stable") + ")"];
    return ["fixture", "#b8bec8", "Not assessed"];
  }
  function opMap(s) {
    var m = {}; (s.alist || []).forEach(function (x) { m[x.id] = parseInt(opStatus(byA[x.id])[1].slice(1), 16); }); return m;
  }
  var pendingFind = null;
  function setupOpen(a, rig) {
    var tg = $("#opentgl"), pt = $("#ptgl"), panel = $("#fpanel");
    if (!rig || !rig.parts() || !tg || !panel) return;
    getArtic(a).then(function (ar) {
      if (!ar) return;
      var acc = groupIdx(ar, "access"), all = ar.joints.map(function (j, i) { return i; }).filter(function (i) { return jfunc(ar.joints[i]); });
      if (!all.length) return;
      var quick = acc.length ? acc : all;
      getIop(a).then(function (iop) {
        var oh = iop ? opsHtml(iop, ar) : "";
        panel.innerHTML = '<div class="fptitle"><b>Parts &amp; functions</b><span class="muted small">' + all.length + " working part" + (all.length === 1 ? "" : "s") + "</span></div>" +
          (oh ? '<div class="ftabs"><button type="button" class="jchip" data-tab="ops" aria-pressed="true">By operation</button><button type="button" class="jchip" data-tab="parts" aria-pressed="false">By part</button></div>' +
            '<div data-pane="ops"><div class="fgroups">' + oh + '</div><p class="muted small">Operations from F1\'s profile that move a part; the dot is F1\'s verdict.</p></div><div data-pane="parts" hidden>' + functionsHtml(ar, a) + "</div>"
            : functionsHtml(ar, a));
        if (oh) { var ps = panel.querySelector('[data-pane="parts"]'), hd = ps.querySelector(".fhead"); if (hd) panel.insertBefore(hd, panel.querySelector(".ftabs")); var fs = ps.querySelector(".fstat"); if (fs) panel.appendChild(fs); }
        panel.hidden = false; pt.hidden = false;
        bindFunctions(panel, ar, a, { open: function (i, on) { if (viewer) viewer.open(i, on); }, highlight: function (i) { return viewer ? viewer.highlight(i) : 0; } });
      });
      pt.addEventListener("click", function () { var on = pt.getAttribute("aria-pressed") !== "true"; pt.setAttribute("aria-pressed", String(on)); panel.hidden = !on; });
      tg.hidden = false; tg.textContent = (acc.length ? "Open all doors & lids (" : "Move all parts (") + quick.length + ")";
      tg.addEventListener("click", function () {
        if (!viewer) return; var on = tg.getAttribute("aria-pressed") !== "true";
        tg.setAttribute("aria-pressed", String(on)); quick.forEach(function (i) { viewer.open(i, on); panel.querySelectorAll('[data-j="' + i + '"]').forEach(function (x) { x.setAttribute("aria-pressed", String(on)); }); });
      });
    });
  }
  // full screen: the 3D box fills the window (Esc or the button to leave)
  function exitFull() {
    var f = document.querySelector(".vfull"); if (!f) return;
    f.classList.remove("vfull"); document.body.classList.remove("v3d-full");
    f.querySelectorAll("[data-fs]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); b.textContent = "⛶ Full screen"; });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-fs]"); if (!b) return;
    var box = b.closest(".amedia"); if (!box) return;
    if (box.classList.contains("vfull")) { exitFull(); return; }
    box.classList.add("vfull"); document.body.classList.add("v3d-full"); b.setAttribute("aria-pressed", "true"); b.textContent = "✕ Exit full screen";
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.querySelector(".vfull")) { e.stopPropagation(); exitFull(); } }, true);
  function bindViewer(a) {
    if (a && !a.glb && a.col) return bindCollisionOnly(a);
    if (!a || !a.glb) return;
    var box = $("#amedia"), st = $("#v3dstat"), bar = $("#v3dbar"), leg = $("#collegend");
    st.textContent = "Loading 3D model…";
    import(new URL("assets/viewer3d.js" + (window.OL_BUILD ? "?v=" + window.OL_BUILD : ""), document.baseURI).href).then(function (m) {
      stopViewer();
      var rigged = false;
      viewer = window.__olViewer = m.mount(box, new URL(a.glb, document.baseURI).href, function (s) {
        st.textContent = s;
        if (!s) { box.classList.add("live"); var img = box.querySelector(".abig"); if (img) img.hidden = true; if (bar) bar.hidden = false; }
        if (!s && a.ar && !rigged) { rigged = true; getArtic(a).then(function (ar) { if (ar && viewer) setupOpen(a, viewer.setArtic(ar)); }); }
      });
      var lt = $("#lidtgl");
      if (lt) lt.addEventListener("click", function () {
        if (!viewer || !viewer.highlightNames) return; var on = lt.getAttribute("aria-pressed") !== "true";
        lt.setAttribute("aria-pressed", String(on)); var n = viewer.highlightNames(on ? a.lidm : null);
        lt.textContent = on ? (n ? "Hide the lid highlight" : "Lid not found in the preview model") : "Show the lid in 3D";
      });
      var jt = $("#jtgl");
      if (jt) jt.addEventListener("click", function () {
        if (!viewer) return; var on = jt.getAttribute("aria-pressed") !== "true";
        jt.setAttribute("aria-pressed", String(on)); viewer.setJoints(a.jm, on); var lg = $("#jlegend"); if (lg) lg.hidden = !on;
      });
      if (bar) bar.addEventListener("click", function (e) {
        var cb = e.target.closest("[data-cb]");
        if (cb && viewer) {
          bar.querySelectorAll("[data-cb]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === cb)); });
          var part = cb.getAttribute("data-cb") === "part"; viewer.colourBy(part ? "part" : "kind");
          if (leg) leg.hidden = part; var pl = $("#plegend");
          if (pl) { pl.hidden = !part; if (part && !pl.innerHTML) getArtic(a).then(function (ar) { pl.innerHTML = partsLegend(ar); }); }
          return;
        }
        var b = e.target.closest("[data-m]"); if (!b || !viewer) return;
        var mode = b.getAttribute("data-m"), byPart = !!bar.querySelector('[data-cb="part"][aria-pressed="true"]');
        bar.querySelectorAll("[data-m]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        var cbs = bar.querySelector(".cby"); if (cbs) cbs.hidden = mode === "model";
        if (leg) leg.hidden = mode === "model" || byPart; var pl2 = $("#plegend"); if (pl2) pl2.hidden = mode === "model" || !byPart;
        viewer.setMode(mode, a.col ? new URL(a.col, document.baseURI).href : null);
      });
    }).catch(function () { st.textContent = "3D viewing is not supported in this browser; showing the picture."; });
  }
  // very large models have no visual preview; show their collision bodies so the collision can still be checked
  function bindCollisionOnly(a) {
    var box = $("#amedia"), st = $("#v3dstat"); if (!box) return;
    st.textContent = "Loading its collision bodies…";
    import(new URL("assets/viewer3d.js" + (window.OL_BUILD ? "?v=" + window.OL_BUILD : ""), document.baseURI).href).then(function (m) {
      stopViewer();
      viewer = window.__olViewer = m.mount(box, new URL(a.col, document.baseURI).href, function (s) {
        if (!s && viewer) { viewer.styleAsCollision(); box.classList.add("live"); var img = box.querySelector(".abig"); if (img) img.hidden = true;
          st.textContent = ""; var cap = document.createElement("div"); cap.className = "colcap small"; cap.textContent = "No visual preview (the model is too large to simplify): showing its " + (a.col_n || "") + " collision bodies. Drag to turn, scroll to zoom."; box.appendChild(cap); }
        else st.textContent = s;
      });
    });
  }
  function openDrawer(html, a) {
    stopViewer();
    dbody.innerHTML = html; drawer.hidden = false; document.body.classList.add("drawer-open"); bindViewer(a); if (a && a.iop) fillIop(a); if (a && a.ifi) fillIfi(a);
    lastFocus = document.activeElement; $("#dclose").focus(); dbody.scrollTop = 0;
  }
  function closeDrawer() {
    stopViewer();
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

  /* ---------- lab classification (step 1, data/lab_families.js v5) ----------
     Two views over one data set: by lab (standard code + name, role, instruments, experiments it supports)
     and by experiment (field -> discipline -> method -> named experiment, with the labs that support it). */
  var LX_ST = { exp: ["已开展", "目录里的论文实验、排头兵实验或论文场景"], ready: ["仪器齐备", "一间基础实验室内仪器齐全，只差流程"],
                partial: ["部分具备", "仪器分散在不同房间，或只在草稿房间"], none: ["缺关键仪器", "所有场景都没有关键仪器"] };
  var LX_TIER = { F: "前沿", A: "应用", S: "标准", R: "常规", T: "经典" }, LX_ORDER = { F: 0, A: 1, S: 2, R: 3, T: 4 }, LX_TK = ["F", "A", "S", "R", "T"];
  var LX_RD = { 3: "机构已验证", 2: "模型可用", 1: "模型待完善", 0: "模型待完善" };
  function lxLab(id) { return (LF.labs || []).filter(function (l) { return l.id === id; })[0]; }
  function lxTier(t) { return '<span class="lx-tier t-' + t.tier + '" title="' + esc(LF.tiers[t.tier]) + '">' + LX_TIER[t.tier] + "</span>"; }
  var LX_LV = { HS: "高中", UG: "大学", PG: "研究生" };
  function lxLvBadge(t) { return '<span class="lx-lvb l-' + t.lv + '">' + LX_LV[t.lv] + "</span>"; }
  function lxRd(t) { return t.rd == null ? '<span class="muted">—</span>' : '<span class="lx-rd r' + t.rd + '">' + LX_RD[t.rd] + "</span>"; }
  function lxBasis(t) { return t.ref ? esc(t.ref) : (t.std ? esc(t.std) : ""); }
  function lxIdx() { var m = {}; LF.disciplines.forEach(function (d) { d.groups.forEach(function (g) { g.types.forEach(function (t) { m[t.id] = { t: t, d: d }; }); }); }); return m; }
  function lxDot(s) { return '<i class="lx-dot s-' + s + '" aria-hidden="true"></i>'; }
  function lxCodes(ids) {
    var ls = ids.map(lxLab).filter(Boolean);
    return ls.map(function (l) { return '<abbr class="lx-code" title="' + esc(l.zh) + '">' + esc(l.code) + "</abbr>"; }).join("");
  }
  function refStats() {
    var L = LF, st = L.status;
    var stats = ["exp", "ready", "partial", "none"].map(function (k) {
      return '<div class="lx-stat">' + lxDot(k) + "<b>" + st[k] + "</b><span>" + LX_ST[k][0] + "</span><small>" + LX_ST[k][1] + "</small></div>";
    }).join("");
    return '<section class="lx-box"><h3>完整实验分类 <span class="muted small">' + L.n_types + ' 项，作为参考</span></h3><div class="lx-stats">' + stats + "</div>" +
      '<p class="lx-tierline">层次：' + LX_TK.map(function (k) { return '<span class="lx-tier t-' + k + '">' + LX_TIER[k] + "</span> " + L.tier_count[k]; }).join("　") +
      '<span class="lx-sep"></span>系统就绪度：<span class="lx-rd r3">机构已验证</span> ' + L.rd_count.L3 + '　<span class="lx-rd r2">模型可用</span> ' + L.rd_count.L2 + '　<span class="lx-rd r1">模型待完善</span> ' + L.rd_count.low + "</p>" + "</section>";
  }
  function mdStats() {
    var L = LF, M = L.mustdo, ML = L.mustdo_lab;
    var done = M.filter(function (m) { return m.steps.every(function (x) { return x[3] === "done"; }) || /已跑通|跑验收/.test(m.status); });
    var gr = {}; M.forEach(function (m) { gr[m.grade] = (gr[m.grade] || 0) + 1; });
    var tile = function (n, t, sub) { return '<div class="lx-stat"><b>' + n + "</b><span>" + t + "</span><small>" + sub + "</small></div>"; };
    var P = L.program || [], n = 0, g2 = {};
    P.forEach(function (sc) { sc.picks.forEach(function (p) { n++; g2[p.grade] = (g2[p.grade] || 0) + 1; }); });
    return tile(P.length, "个场景", "每间实验室选五项代表实验") +
      tile(n, "项代表实验", ["S", "A", "B", "C", "D"].filter(function (g) { return g2[g]; }).map(function (g) { return g + " " + g2[g]; }).join(" · ")) +
      tile(M.length, "必做实验", "全部安排在 " + esc(ML.code) + " " + esc(ML.name)) +
      tile(ML.add.length, "台仪器加入 " + esc(ML.code), esc(ML.build_note || ""));
  }
  function famView() {
    var L = LF, st = L.status;
    var stats = ["exp", "ready", "partial", "none"].map(function (k) {
      return '<div class="lx-stat">' + lxDot(k) + "<b>" + st[k] + "</b><span>" + LX_ST[k][0] + "</span><small>" + LX_ST[k][1] + "</small></div>";
    }).join("");
    return '<div class="lx" lang="zh">' +
      '<section class="lx-head"><div class="lx-title"><h2>' + esc(L.title) + '</h2><span class="muted small">' + esc(L.updated) + "</span></div>" +
      '<p class="lx-answer">' + esc(L.summary) + '</p><div class="lx-stats">' + mdStats() + "</div></section>" +

      '<div class="lx-mode" role="group" aria-label="查看方式"><button type="button" data-lxmode="top">代表实验与评级</button><button type="button" data-lxmode="labs">按实验室（参考）</button><button type="button" data-lxmode="exps">按实验（参考）</button></div>' +
      '<div class="lx-pane" data-pane="top">' + topPane() + "</div>" +
      '<div class="lx-pane" data-pane="labs">' + refStats() + labView() + "</div>" +
      '<div class="lx-pane" data-pane="exps">' + refStats() + expPane() + "</div>" +
      '<section class="lx-box"><h3>任务层级</h3><p class="muted small">按机器人要完成的任务长度分级，目录里 ' + L.n_exps + " 个条目（" + L.n_cat + " 个实验、" + (L.n_exps - L.n_cat) + ' 条操作链）的分布：</p><div class="lx-levels">' +
      L.levels.map(function (v) { return '<div class="lx-lv"><span class="muted small">L' + v.n + "</span><b>" + esc(v.name) + '</b><span class="lx-lvn">' + v.count + ' <small>个</small></span><small class="muted">' + esc(v.eg) + (v.note ? "；" + esc(v.note) : "") + "</small></div>"; }).join('<span class="lx-arrow" aria-hidden="true">→</span>') + "</div></section>" +
      '<section class="lx-box"><h3>分类与命名依据</h3><dl class="lx-basis">' + L.basis.map(function (x) { return "<dt>" + esc(x[0]) + "</dt><dd>" + esc(x[1]) + "</dd>"; }).join("") + "</dl></section>" +
      '<section class="lx-box lx-decide"><h3>需要你定</h3><ul>' + L.decide.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></section></div>";
  }
  /* By experiment: one section per field, one card per discipline, one row per named experiment. */
  function expPane() {
    var L = LF, D = L.disciplines;
    var byN = {}; D.forEach(function (d) { byN[d.n] = d; });
    var count = function (d) { var c = { exp: 0, ready: 0, partial: 0, none: 0, n: 0 }; d.groups.forEach(function (g) { g.types.forEach(function (t) { c[t.s]++; c.n++; }); }); return c; };
    var bar = function (c) { return '<span class="lx-bar" title="已开展 ' + c.exp + " · 仪器齐备 " + c.ready + " · 部分具备 " + c.partial + " · 缺关键仪器 " + c.none + '">' +
      ["exp", "ready", "partial", "none"].map(function (k) { return c[k] ? '<i class="s-' + k + '" style="flex:' + c[k] + '"></i>' : ""; }).join("") + "</span>"; };
    var row = function (t) {
      var side = t.lab_ids.length ? lxCodes(t.lab_ids.slice(0, 3)) + (t.lab_ids.length > 3 ? '<span class="lx-more-n">+' + (t.lab_ids.length - 3) + "</span>" : "")
        : '<span class="lx-meta">' + esc(t.note || "") + "</span>";
      var tag = t.extra[0] ? '<span class="lx-tag">' + esc(t.extra[0]) + "</span>" : "";
      var more = "<dt>层次</dt><dd>" + esc(LF.tiers[t.tier]) + (lxBasis(t) ? "（" + lxBasis(t) + "）" : "") + "</dd>" +
        (t.exps.length ? "<dt>目录记录</dt><dd>" + t.exps.map(eChip).join("") + "</dd>" : "") +
        (t.rd != null ? "<dt>系统就绪度</dt><dd>" + lxRd(t) + "（" + esc(lxLab(t.rd_lab).code) + "）</dd>" : "") +
        "<dt>支持的实验室</dt><dd>" + (t.lab_ids.length ? t.lab_ids.map(function (id) { var l = lxLab(id); return '<span class="lx-labline"><b>' + esc(l.code) + "</b> " + esc(l.zh) + "</span>"; }).join("") : '<span class="muted">' + esc(t.note || "暂无") + "</span>") + "</dd>" +
        (t.near.length ? "<dt>差一件仪器</dt><dd>" + t.near.map(function (x) { var l = lxLab(x.lab); return '<span class="lx-labline"><b>' + esc(l.code) + "</b> 缺" + esc(x.miss) + "</span>"; }).join("") + "</dd>" : "");
      var flag = t.flag ? '<span class="lx-flag" title="必做实验 ' + t.flag.n + '">必做</span>' : "";
      var pick = t.pick ? '<span class="lx-tag lx-pick">代表 · ' + esc(t.pick.code) + "</span>" : "";
      if (t.grade) more = "<dt>评级</dt><dd>" + lxGrade(t.grade, t.grade_total) + " " + t.grade_total + " 分" + (t.grade_scores ? ' <span class="muted small">' + LF.rubric.map(function (r) { return esc(r.name.slice(0, 2)) + " " + t.grade_scores[r.k]; }).join(" · ") + "</span>" : "") + (t.pick ? "（按 " + esc(t.pick.code) + " 计算）" : "") + "</dd>" + more;
      if (t.flag) more = "<dt>必做实验</dt><dd>第 " + t.flag.n + ' 项 · <a href="' + esc(t.flag.video) + '" target="_blank" rel="noopener">参考视频</a>' + (t.flag.lane ? " · " + esc(t.flag.lane) + "在 " + esc(lxLab(t.flag.home).code) + " 进行" : "") + "</dd>" + more;
      if (t.src) more += "<dt>依据</dt><dd>" + esc(t.src) + "</dd>";
      return '<li data-tier="' + t.tier + '" data-lv="' + t.lv + '"' + (t.pick ? ' data-pick="1"' : "") + (t.flag ? ' class="is-flag"' : "") + '><details><summary>' + lxDot(t.s) + lxLvBadge(t) + (t.grade ? lxGrade(t.grade, t.grade_total) : "") + '<span class="lx-name">' + flag + esc(t.name) + tag + pick + '</span><span class="lx-side">' + side + '</span></summary><dl class="lx-more">' + more + "</dl></details></li>";
    };
    var legend = '<section class="lx-box lx-legend"><h3>实验室代码</h3><div class="lx-codes">' + L.labs.map(function (l) {
      return '<span><b>' + esc(l.code) + "</b>" + esc(l.zh) + "</span>"; }).join("") + "</div></section>";
    var doms = L.domains.map(function (dm) {
      var cards = dm.ns.map(function (n) {
        var d = byN[n], c = count(d);
        return '<section class="lx-card" id="lx-d' + esc(d.n) + '"><header><span class="lx-num">' + esc(d.n) + '</span><div class="lx-ht"><h3>' + esc(d.zh) + '</h3><span class="muted small">' + esc(d.en) + '</span></div><span class="lx-cnt">' + c.n + " 项</span></header>" + bar(c) +
          d.groups.map(function (g) { return (g.label ? '<h4 class="lx-glabel">' + esc(g.label) + "</h4>" : "") + '<ul class="lx-types">' + g.types.slice().sort(function (a, b) { return LX_ORDER[a.tier] - LX_ORDER[b.tier]; }).map(row).join("") + "</ul>"; }).join("") + "</section>";
      }).join("");
      var jump = dm.ns.map(function (n) { return '<button type="button" class="lx-jbtn" data-lxjump="' + esc(n) + '"><b>' + esc(n) + "</b>" + esc(byN[n].zh) + "</button>"; }).join("");
      return '<section class="lx-dom"><div class="lx-domhead"><h3>' + esc(dm.zh) + ' <span class="muted">' + esc(dm.en) + '</span></h3><span class="lx-cnt">' + dm.count + ' 项实验</span></div><nav class="lx-jump">' + jump + '</nav><div class="lx-grid">' + cards + "</div></section>";
    }).join("");
    var filt = '<div class="lx-filter" role="group" aria-label="按层次筛选"><span class="lx-k">按层次筛选</span><button type="button" data-lxtier="all" aria-pressed="true">全部</button>' +
      LX_TK.map(function (k) { return '<button type="button" data-lxtier="' + k + '" aria-pressed="false">' + esc(LF.tiers[k]) + " " + LF.tier_count[k] + "</button>"; }).join("") + "</div>";
    var lvf = '<div class="lx-filter" role="group" aria-label="按学段筛选"><span class="lx-k">按学段筛选</span><button type="button" data-lxlv="all" aria-pressed="true">全部</button>' +
      ["HS", "UG", "PG"].map(function (k) { return '<button type="button" data-lxlv="' + k + '" aria-pressed="false">' + esc(LF.levels_edu[k]) + " " + LF.level_count[k] + "</button>"; }).join("") +
      '<button type="button" data-lxlv="PICK" aria-pressed="false">只看代表实验 ' + (LF.program || []).reduce(function (n, sc) { return n + sc.picks.length; }, 0) + "</button></div>";
    return legend + skillStrip() + lvf + filt + '<div class="lx-doms">' + doms + "</div>";
  }
  /* Must-do experiments in C-01 and our own grading of them and of the frontier candidates. */
  var LX_STEP = { ok3: ["机构已确认", "r3"], ok2: ["已具备·模型可用", "r2"], ok1: ["已具备·模型待完善", "r1"], add: ["已加入新版本·待检查", "add"], miss: ["缺资产", "miss"], done: ["已跑通", "done"] };
  function lxGrade(g, tot) { return '<span class="lx-grade g-' + g + '" title="综合 ' + tot + ' 分">' + g + "</span>"; }
  function lxBars(sc) {
    return '<span class="lx-dims">' + LF.rubric.map(function (r) { return '<span class="lx-dim" title="' + esc(r.name + "：" + sc[r.k] + "/5") + '"><i style="height:' + (sc[r.k] * 20) + '%"></i><b>' + esc(r.name.slice(0, 2)) + "</b></span>"; }).join("") + "</span>";
  }
  /* Ten scenes x five representative experiments: what we chose as most worth doing. */
  function programView() {
    var L = LF, P = L.program || [];
    var lvc = { HS: 0, UG: 0, PG: 0 }; P.forEach(function (sc) { sc.picks.forEach(function (p) { lvc[p.lv]++; }); });
    var cards = P.map(function (sc) {
      var rows = sc.picks.map(function (p) {
        return '<li title="' + esc(p.why) + '">' + lxGrade(p.grade, p.total) + lxLvBadge(p) + '<span class="lx-pn">' + (p.must ? '<span class="lx-flag">必做</span>' : "") + esc(p.name) +
          '<span class="lx-pwhy">' + esc(p.why) + "</span></span>" + lxRd(p) + "</li>";
      }).join("");
      return '<section class="lx-scene"><header><span class="lx-codebig">' + esc(sc.code) + '</span><div class="lx-ht"><h3>' + esc(sc.name) + '</h3><span class="muted small">' + esc(sc.theme) + "</span></div></header><ol class=\"lx-picks\">" + rows + "</ol></section>";
    }).join("");
    return '<section class="lx-box lx-prog"><h3>十个场景 · 五十项代表实验 <span class="muted small">每间实验室选五项最值得做的实验；高中 ' + lvc.HS + " · 大学 " + lvc.UG + " · 研究生及以上 " + lvc.PG + "</span></h3>" +
      '<p class="muted small">每个场景兼顾经典教学、标准方法和前沿研究；入选实验在该实验室内仪器齐备或已开展。等级按下方七项评分，实验室条件与机构就绪按该实验室计算。C-01 的五项是负责人指定的必做实验，详细步骤见下文。</p>' +
      '<div class="lx-scenes">' + cards + "</div></section>";
  }
  function topPane() {
    var L = LF, ML = L.mustdo_lab, lab = lxLab(ML.lab);
    var head = '<section class="lx-box lx-mdhead"><div class="lx-mdtitle"><span class="lx-codebig">' + esc(ML.code) + "</span><h3>五项必做实验 · " + esc(ML.name) + "</h3></div>" +
      '<p class="lx-role">' + esc(ML.why) + "</p>" +
      (ML.build ? '<p class="lx-build"><span class="lx-st s-add">新房间版本</span> ' + esc(ML.build.check) + ' <span class="muted small">叠加层 ' + esc(ML.build.sha8) + "，不改动先锋 T 正在用的场景</span></p>" : "") +
      '<div class="lx-mdgrid"><div><span class="lx-k">加入的仪器</span><ul>' + ML.add.map(function (x) { return "<li><b>" + esc(x.what) + "</b> → " + esc(x.where) + ' <span class="muted small">（' + esc(x.for) + "）</span></li>"; }).join("") + "</ul></div>" +
      '<div><span class="lx-k">还缺的小件</span><ul>' + ML.small_gaps.map(function (x) { return "<li>" + esc(x.what) + ' <span class="muted small">' + esc(x.state) + "</span></li>"; }).join("") + "</ul></div></div></section>";
    var cards = L.mustdo.map(function (m) {
      var rows = m.steps.map(function (st, i) {
        var s = LX_STEP[st[3]];
        return '<tr><td class="num">' + (i + 1) + "</td><td>" + esc(st[0]) + '</td><td class="small">' + esc(st[1]) + '</td><td class="small">' + esc(st[2]) + '</td><td><span class="lx-st s-' + s[1] + '">' + s[0] + "</span></td></tr>";
      }).join("");
      return '<section class="lx-box lx-md"><div class="lx-mdtop"><span class="lx-mdn">' + m.n + "</span><div class=\"lx-ht\"><h3>" + esc(m.name) + '</h3><span class="muted small">' + esc(ML.code) + " · " + esc(m.where) + ' · <a href="' + esc(m.video) + '" target="_blank" rel="noopener">参考视频</a></span></div>' +
        lxGrade(m.grade, m.total) + '<span class="lx-tot">' + m.total + "</span></div>" +
        '<p class="lx-mdstatus">' + esc(m.status) + "</p>" + lxBars(m.scores) + '<p class="muted small lx-why">' + esc(m.why) + "</p>" +
        '<div class="lx-tblwrap"><table class="lx-rt lx-steps"><thead><tr><th>#</th><th>步骤</th><th>机器人动作</th><th>仪器 / 物品（位置）</th><th>状态</th></tr></thead><tbody>' + rows + "</tbody></table></div></section>";
    }).join("");
    var rub = '<dl class="lx-basis">' + L.rubric.map(function (r) { return "<dt>" + esc(r.name) + " · " + Math.round(r.w * 100) + "%</dt><dd>" + esc(r.anchors) + "</dd>"; }).join("") + "</dl>" +
      '<p class="muted small">综合分 = 各项分数按权重相加（满分 5）。等级：' + L.grade_cuts.map(function (c) { return c[1] + (c[0] ? " ≥ " + c[0] : ""); }).join("，") + "。实验室条件与机构就绪由场景数据计算，其余五项是我们的判断，理由写在每行。</p>";
    var gt = L.graded.map(function (g) {
      var l = g.lab ? lxLab(g.lab) : null;
      return "<tr><td>" + lxGrade(g.grade, g.total) + '</td><td class="num">' + g.total + "</td><td>" + esc(g.name) + '<span class="muted small lx-disc">' + esc(g.kind) + (g.ref ? " · " + esc(g.ref) : "") + "</span></td><td>" + (l ? lxCodes([g.lab]) : "—") + "</td>" +
        L.rubric.map(function (r) { return '<td class="num lx-sc s' + g.scores[r.k] + '">' + g.scores[r.k] + "</td>"; }).join("") + '<td class="small">' + esc(g.why) + "</td></tr>";
    }).join("");
    return programView() + head + cards + coverage() +
      '<section class="lx-box"><h3>实验评级 <span class="muted small">我们自己的七项评分，必做实验与前沿候选用同一标准</span></h3>' + rub +
      '<div class="lx-tblwrap"><table class="lx-rt lx-gt"><thead><tr><th>等级</th><th>分</th><th>实验</th><th>实验室</th>' + L.rubric.map(function (r) { return '<th title="' + esc(r.name) + '">' + esc(r.name.slice(0, 2)) + "</th>"; }).join("") + "<th>评语</th></tr></thead><tbody>" + gt + "</tbody></table></div></section>";
  }
  /* School-to-research coverage: classic high-school and university experiments across the three fields. */
  function coverage() {
    var L = LF, D = L.disciplines, by = {};
    D.forEach(function (d) { d.groups.forEach(function (g) { g.types.forEach(function (t) {
      var k = d.dom + "|" + t.lv; by[k] = by[k] || { n: 0, ok: 0 }; by[k].n++; if (t.s === "exp" || t.s === "ready") by[k].ok++;
    }); }); });
    var cell = function (dm, lv) { var c = by[dm + "|" + lv] || { n: 0, ok: 0 }; return '<td class="num"><b>' + c.n + '</b> <span class="muted small">其中 ' + c.ok + " 项可做</span></td>"; };
    var tbl = '<div class="lx-tblwrap"><table class="lx-rt lx-cov"><thead><tr><th>领域</th><th>高中</th><th>大学</th><th>研究生及以上</th></tr></thead><tbody>' +
      L.domains.map(function (dm) { return "<tr><th>" + esc(dm.zh) + "</th>" + cell(dm.id, "HS") + cell(dm.id, "UG") + cell(dm.id, "PG") + "</tr>"; }).join("") + "</tbody></table></div>";
    var hs = function (field) {
      var items = [];
      D.forEach(function (d) { if (field.indexOf(d.dom) < 0) return; d.groups.forEach(function (g) { g.types.forEach(function (t) {
        if (t.lv === "HS") items.push('<li>' + lxDot(t.s) + esc(t.name) + ' <span class="lx-hsl">' + (t.lab_ids.length ? lxCodes(t.lab_ids.slice(0, 3)) : '<span class="lx-meta">' + esc(t.note || "") + "</span>") + "</span></li>");
      }); }); });
      return items.join("");
    };
    return '<section class="lx-box"><h3>经典实验覆盖 <span class="muted small">高中、大学到研究生，化学、材料、生物</span></h3>' +
      '<p class="muted small">高中实验取自教育部《普通高中化学课程标准》附录 3 的 18 个学生必做实验（不含搭建球棍模型）和《普通高中生物学课程标准》各模块教学提示中的实验（不含建模、调查与讨论类活动）；电镀、原电池、燃料电池归在材料领域的能源材料与电化学。大学实验取自各门实验课程的常见题目和标准方法。“可做”指一间基础实验室内仪器齐备，或已开展。</p>' + tbl +
      '<div class="lx-mdgrid"><div><span class="lx-k">高中化学与材料 · 学生必做实验</span><ul class="lx-hs">' + hs(["C", "M"]) + '</ul></div><div><span class="lx-k">高中生物 · 课程标准实验</span><ul class="lx-hs">' + hs(["B"]) + "</ul></div></div></section>";
  }
  /* Basic robot skills: used by every experiment, listed apart from the experiments. */
  function skillStrip() {
    var S = LF.skills || [], chains = [];
    S.forEach(function (k) { chains = chains.concat(k.exps); });
    return '<section class="lx-box lx-skills"><h3>机器人基础技能 <span class="muted small">每项实验都要用，不计入实验</span></h3><div class="lx-sk">' +
      S.map(function (k) { return '<span class="lx-skill">' + esc(k.name) + "</span>"; }).join("") + "</div>" +
      (chains.length ? '<p class="muted small">已有操作链：</p><div class="chips">' + chains.map(eChip).join("") + "</div>" : "") + "</section>";
  }
  /* By lab: lab x discipline matrix (grouped by field), then one card per base lab. */
  function labView() {
    var L = LF, D = L.disciplines, max = 1;
    var short = function (n) { return n.replace(/（[^）]*）/g, ""); };
    L.labs.forEach(function (l) { D.forEach(function (d) { max = Math.max(max, l.by[d.n] || 0); }); });
    var head1 = '<tr><th rowspan="2">实验室</th>' + L.domains.map(function (dm) { return '<th class="lx-domcol" colspan="' + dm.ns.length + '">' + esc(dm.zh) + "</th>"; }).join("") + '<th rowspan="2">合计</th><th rowspan="2" title="代表实验">代表</th></tr>';
    var head2 = "<tr>" + D.map(function (d) { return '<th title="' + esc(d.n + " " + d.zh) + '">' + esc(d.short) + "</th>"; }).join("") + "</tr>";
    var rows = L.labs.map(function (l) {
      return '<tr><th><button type="button" class="lx-lablink" data-lxlab="' + esc(l.id) + '"><b>' + esc(l.code) + "</b> " + esc(l.zh) + "</button></th>" +
        D.map(function (d) {
          var n = l.by[d.n] || 0, pct = Math.round(14 + 56 * n / max);
          return n ? '<td class="c" title="' + esc(l.code + " " + l.zh + " · " + d.zh + "：" + n + " 项") + '" style="background:color-mix(in srgb, var(--accent) ' + pct + '%, transparent)">' + n + "</td>" : '<td class="c z"></td>';
        }).join("") + '<td class="num">' + l.n + '</td><td class="num">' + ((LF.program || []).filter(function (sc) { return sc.lab === l.id; }).map(function (sc) { return sc.picks.length; })[0] || "") + "</td></tr>";
    }).join("");
    var cards = L.labs.map(function (l) {
      var s0 = byS[l.id] || {}, near = [], lines = [];
      D.forEach(function (d) {
        var ts = [];
        d.groups.forEach(function (g) { g.types.forEach(function (t) {
          if (t.lab_ids.indexOf(l.id) >= 0) ts.push('<span class="lx-tp">' + lxDot(t.s) + esc(short(t.name)) + "</span>");
          t.near.forEach(function (x) { if (x.lab === l.id) near.push("<li><b>" + esc(short(t.name)) + "</b><span>缺" + esc(x.miss) + "</span></li>"); });
        }); });
        if (ts.length) lines.push('<div class="lx-dl"><span class="lx-dk">' + esc(d.zh) + ' <span class="muted">' + ts.length + '</span></span><span class="lx-dv">' + ts.join("") + "</span></div>");
      });
      var ins = l.instruments, insShow = ins.slice(0, 10);
      var sc = (LF.program || []).filter(function (x) { return x.lab === l.id; })[0];
      var picks = sc ? '<div class="lx-lsec lx-lpicks"><span class="lx-k">代表实验 · ' + sc.picks.length + " 项（" + esc(sc.theme) + '）</span><ol class="lx-picks">' + sc.picks.map(function (p) {
        return "<li>" + lxGrade(p.grade, p.total) + lxLvBadge(p) + '<span class="lx-pn">' + (p.must ? '<span class="lx-flag">必做</span>' : "") + esc(p.name) + "</span>" + lxRd(p) + "</li>"; }).join("") + "</ol></div>" : "";
      var added = (l.added && l.added.length) ? '<p class="lx-build"><span class="lx-st s-add">新房间版本加入</span> ' + esc(l.added.join("、")) + ' <span class="muted small">（已计入下面的可开展实验）</span></p>' : "";
      return '<section class="lx-lab" id="lx-lab-' + esc(l.id) + '"><header>' + (s0.img ? '<img class="lx-lthumb" loading="lazy" alt="" src="' + esc(s0.img) + '">' : '<span class="lx-lthumb none"></span>') +
        '<div class="lx-ht"><h3><span class="lx-codebig">' + esc(l.code) + "</span>" + esc(l.zh) + '</h3><span class="muted small">' + esc(l.en) + '</span></div><span class="lx-cnt">' + l.n + " 项</span></header>" +
        '<p class="lx-role">' + esc(l.role) + "</p>" + added + picks +
        (ins.length ? '<div class="lx-lsec"><span class="lx-k">主要仪器 · ' + ins.length + ' 台套</span><p class="lx-ins">' + esc(insShow.join("、")) +
          (ins.length > 10 ? '<details class="lx-insmore"><summary>其余 ' + (ins.length - 10) + " 台套</summary>" + esc(ins.slice(10).join("、")) + "</details>" : "") + "</p></div>" : "") +
        (function () { var fr = []; D.forEach(function (d) { d.groups.forEach(function (g) { g.types.forEach(function (t) { if (t.tier === "F" && t.lab_ids.indexOf(l.id) >= 0) fr.push(t); }); }); });
          return fr.length ? '<div class="lx-lsec lx-frline"><span class="lx-k">可开展的前沿实验 · ' + fr.length + ' 项</span><ul>' + fr.map(function (t) { return "<li>" + esc(t.name) + ' <span class="muted small">' + esc(t.ref) + "</span></li>"; }).join("") + "</ul></div>" : ""; })() +
        '<div class="lx-lsec"><span class="lx-k">已放在这间的目录实验</span>' + (l.exps_here.length ? '<div class="chips">' + l.exps_here.map(eChip).join("") + "</div>" : '<span class="muted small">还没有</span>') + "</div>" +
        '<div class="lx-lsec"><span class="lx-k">能开展的实验（仪器齐备）</span>' + (lines.length ? lines.join("") : '<span class="muted small">本间仪器不足以独立开展实验，需与其他实验室配合</span>') + "</div>" +
        (near.length ? '<details class="lx-lsec lx-nearbox"><summary><span class="lx-k">差一件仪器就能开展 · ' + near.length + ' 项</span></summary><ul class="lx-near">' + near.join("") + "</ul></details>" : "") +
        (l.skills.length ? '<p class="lx-skl"><span class="lx-k">基础技能</span> ' + esc(l.skills.join("、")) + "</p>" : "") +
        '<p class="lx-lfoot">' + (byS[l.id] ? go("scenes", l.id, "场景记录与三维预览 →") : "") + "</p></section>";
    }).join("");
    return '<section class="lx-box"><h3>实验室能力矩阵</h3><p class="muted small">数字为该实验室内仪器齐备、可独立开展的实验项数，颜色越深越多。点击实验室名称查看详情。</p>' +
      '<div class="lx-tblwrap"><table class="lx-mx"><thead>' + head1 + head2 + "</thead><tbody>" + rows + "</tbody></table></div></section>" +
      '<div class="lx-labs">' + cards + "</div>";
  }
  function bindFam() {
    var root = $("#view").querySelector(".lx");
    if (!root) return;
    var setMode = function (m) {
      root.querySelectorAll("[data-lxmode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-lxmode") === m ? "true" : "false"); });
      root.querySelectorAll(".lx-pane").forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== m; });
      try { localStorage.setItem("ol.lx.mode3", m); } catch (e) { /* storage unavailable */ }
    };
    var saved = "top";
    try { saved = localStorage.getItem("ol.lx.mode3") || "top"; } catch (e) { /* storage unavailable */ }
    setMode(["top", "labs", "exps"].indexOf(saved) >= 0 ? saved : "top");
    var doms = root.querySelector(".lx-doms");
    root.querySelectorAll("[data-lxlv]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-lxlv");
        root.querySelectorAll("[data-lxlv]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (doms) { if (k === "all") doms.removeAttribute("data-lv"); else doms.setAttribute("data-lv", k); }
      });
    });
    root.querySelectorAll("[data-lxtier]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-lxtier");
        root.querySelectorAll("[data-lxtier]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (doms) { if (k === "all") doms.removeAttribute("data-tier"); else doms.setAttribute("data-tier", k); }
      });
    });
    root.querySelectorAll("[data-lxmode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-lxmode")); }); });
    root.querySelectorAll("[data-lxjump]").forEach(function (b) {
      b.addEventListener("click", function () { var t = document.getElementById("lx-d" + b.getAttribute("data-lxjump")); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
    });
    root.querySelectorAll("[data-lxlab]").forEach(function (b) {
      b.addEventListener("click", function () { var t = document.getElementById("lx-lab-" + b.getAttribute("data-lxlab")); if (t) t.scrollIntoView({ behavior: "smooth", block: "start" }); });
    });
  }

  var current = "";
  function render() {
    var v = current;
    views.querySelectorAll("[data-view]").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-view") === v ? "true" : "false"); });
    if (v === "scenes") { $("#view").innerHTML = scenesView(); bindScenes(); }
    else if (v === "experiments") { $("#view").innerHTML = expView(); }
    else if (v === "families" && LF) { $("#view").innerHTML = famView(); bindFam(); }
    else if (v === "accept" && window.F1ACC) { $("#view").innerHTML = window.F1ACC.html(); window.F1ACC.bind($("#view")); }
    else { $("#view").innerHTML = assetsView(); bindAssets(); }
  }
  function route() {
    var h = location.hash.replace(/^#/, ""), k = h.indexOf("/");
    var v = (k < 0 ? h : h.slice(0, k)) || "assets", id = k < 0 ? "" : decodeURIComponent(h.slice(k + 1));
    if (["assets", "scenes", "experiments", "families", "accept"].indexOf(v) < 0) v = "assets";
    if (v !== current) { current = v; render(); }
    if (id) {
      var item = v === "assets" ? byA[id] : v === "scenes" ? byS[id] : byE[id];
      if (item) { openDrawer(v === "assets" ? assetDetail(item) : v === "scenes" ? sceneDetail(item) : expDetail(item), v === "assets" ? item : null); if (v === "scenes") bindScene(item); }
    } else if (!drawer.hidden) { stopViewer(); drawer.hidden = true; document.body.classList.remove("drawer-open"); }
  }
  window.addEventListener("hashchange", route);
  route();
})();
