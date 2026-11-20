/* index.html — per-step progress. Hash routes: #<group>[/<item>] (e.g. #base/legacy_l0), #<stepId>, #summary. */
(function () {
  "use strict";
  var S = window.STATUS, OL = window.OL, esc = OL.esc, store = OL.store;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  OL.initTheme($("#themeBtn"));
  if (!S) { $("#updated").textContent = "Status data failed to load."; return; }
  var P = S.pipeline || null;
  $("#updated").textContent = "Updated " + (P && P.updated > S.updated ? P.updated : S.updated) + " (" + S.tz + ")";

  /* steps: from the pipeline, plus any group no step claims */
  var groupsById = {};
  S.groups.forEach(function (g) { groupsById[g.id] = g; });
  var steps = P ? P.steps.map(function (s) { return { id: s.id, n: s.n, title: s.title, what: s.what, mentor: s.mentor, groups: s.groups.filter(function (id) { return groupsById[id]; }) }; }) : [];
  var claimed = {};
  steps.forEach(function (s) { s.groups.forEach(function (id) { claimed[id] = 1; }); });
  var extra = S.groups.filter(function (g) { return !claimed[g.id]; }).map(function (g) { return g.id; });
  if (extra.length) steps.push({ id: "more", n: "+", title: steps.length ? "More" : "Status", what: "", groups: extra });
  var stepOfGroup = {};
  steps.forEach(function (s) { s.groups.forEach(function (id) { stepOfGroup[id] = s; }); });
  var stages = P ? P.stages : [];

  /* live-view session + port */
  var port = store.get("dbgPort") || String(S.default_port || "");
  var sess = S.session || { online: false };
  $("#session").innerHTML = OL.pill(sess.online ? "online" : "offline", sess.online ? "Live view on" + (sess.expires ? " · until " + sess.expires : "") : "Live view off");
  $("#session").title = sess.note || "";
  $("#portInput").value = port;
  $("#portInput").addEventListener("change", function () {
    var p = parseInt(this.value, 10);
    if (p > 1023 && p < 65536) { port = String(p); store.set("dbgPort", port); route(); } else this.value = port;
  });
  function viewerUrl(item) { return "http://127.0.0.1:" + port + "/?gpu=0&scene=" + encodeURIComponent(item.scene || item.id); }

  /* top tabs */
  var nav = $("#tabs");
  nav.innerHTML = '<a class="tab" href="agents.html">Plan &amp; progress</a>' + steps.map(function (s) {
    return '<button class="tab ' + esc(s.id) + '" role="tab" data-step="' + esc(s.id) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</button>";
  }).join("") + '<button class="tab" role="tab" data-step="summary">Goals &amp; timeline</button>';
  nav.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]"); if (!b) return;
    var id = b.getAttribute("data-step");
    location.hash = id === "summary" ? "#summary" : "#" + (steps.filter(function (s) { return s.id === id; })[0].groups[0]);
  });
  function markTab(id) {
    nav.querySelectorAll("[data-step]").forEach(function (b) {
      var on = b.getAttribute("data-step") === id;
      b.setAttribute("aria-selected", on ? "true" : "false"); b.tabIndex = on ? 0 : -1;
    });
  }

  function stagesFor(step, gid) {
    return stages.filter(function (st) {
      if (st.step !== step.id) return false;
      if (st.group === gid) return true;
      return step.groups.indexOf(st.group) < 0 && step.groups[0] === gid; // stage whose detail lives in another step
    }).sort(function (a, b) { return a.row - b.row; });
  }

  function itemButton(it) {
    var mini = it.metrics ? '<div class="mini">' + OL.metricRows(it.metrics.slice(0, 2), true) + "</div>" : "";
    return '<button class="item-btn" type="button" data-id="' + esc(it.id) + '"><span class="item-name">' + esc(it.title) + "</span>" +
      '<span class="item-meta">' + OL.pill(it.status) + '<span class="tag">' + esc(it.tag) + "</span></span>" + mini + "</button>";
  }

  function renderItem(g, it) {
    document.querySelectorAll(".item-btn").forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-id") === it.id ? "true" : "false"); });
    var v = $("#viewer");
    var live = it.live && sess.online;
    var head = '<div class="vhead"><div><div class="vtitle">' + esc(it.title) + '</div><div class="vline">' + OL.pill(it.status) + "<span>" + esc(it.line) + "</span></div></div>" +
      (live ? '<div class="vact"><button class="btn" id="connectBtn" type="button">Open live</button><a class="btn secondary" target="_blank" rel="noopener" href="' + esc(viewerUrl(it)) + '">New tab</a></div>' : "") + "</div>";
    var media = "";
    if (live && store.get("autoConnect") === "1") {
      media = '<div class="media"><iframe title="Live Isaac Sim view" src="' + esc(viewerUrl(it)) + '" allow="fullscreen; autoplay"></iframe></div>';
    } else if (it.img) {
      var msg = !it.live ? "" : (!sess.online ? " · opens live here during a debug session" : " · open your SSH tunnel, then press Open live");
      media = '<div class="media has-img"><img loading="lazy" alt="' + esc(it.title) + ' (snapshot)" src="' + esc(it.img) + '"><div class="media-cap">Snapshot' + (S.snapshots_taken ? " " + esc(S.snapshots_taken) : "") + esc(msg) + "</div></div>";
    } else if (it.live) {
      media = '<div class="media"><div class="ph">No snapshot yet. ' + (sess.online ? "Open your SSH tunnel, then press Open live." : "Opens live here during a debug session.") + "</div></div>";
    }
    v.innerHTML = head + media + OL.tiles(it.metrics) + (it.details ? '<p class="details-text">' + esc(it.details) + "</p>" : "");
    var cb = $("#connectBtn");
    if (cb) cb.addEventListener("click", function () {
      store.set("autoConnect", "1");
      var m = $(".media", v), html = '<iframe title="Live Isaac Sim view" src="' + esc(viewerUrl(it)) + '" allow="fullscreen; autoplay"></iframe>';
      if (m) { m.className = "media"; m.innerHTML = html; } else v.insertAdjacentHTML("beforeend", '<div class="media">' + html + "</div>");
    });
    var h = "#" + g.id + "/" + it.id;
    if (location.hash !== h) history.replaceState(null, "", h);
  }

  function renderGroup(g, itemId) {
    var step = stepOfGroup[g.id];
    markTab(step.id);
    var main = $("#main");
    main.className = "wrap " + step.id;
    var band = step.id === "more" ? "" :
      '<section class="stepband"><div class="stepnum">' + esc(step.n) + '</div><h1>Step ' + esc(step.n) + " · " + esc(step.title) + "</h1>" +
      (step.mentor ? '<span class="chip">Mentor: ' + esc(step.mentor) + "</span>" : "") + "<p>" + esc(step.what) + "</p></section>";
    var sub = step.groups.length > 1 ? '<nav class="subtabs" aria-label="Parts of this step">' + step.groups.map(function (id) {
      return '<button class="subtab" type="button" data-group="' + esc(id) + '" aria-current="' + (id === g.id) + '">' + esc(groupsById[id].title) + "</button>";
    }).join("") + "</nav>" : "";
    var sts = stagesFor(step, g.id);
    var cards = sts.length ? '<section class="stages">' + sts.map(function (st) {
      var href = st.group === g.id && !st.item ? null : "#" + st.group + (st.item ? "/" + st.item : "");
      return OL.stageCard(st, href);
    }).join("") + "</section>" : "";
    main.innerHTML = band + sub + cards + '<p class="blurb">' + esc(g.blurb) + "</p>" +
      '<div class="console"><div class="items" role="list">' + g.items.map(itemButton).join("") + '</div><div class="viewer" id="viewer"></div></div>';
    main.querySelectorAll(".subtab").forEach(function (b) { b.addEventListener("click", function () { location.hash = "#" + b.getAttribute("data-group"); }); });
    main.querySelectorAll(".item-btn").forEach(function (b) {
      b.addEventListener("click", function () { renderItem(g, g.items.filter(function (x) { return x.id === b.getAttribute("data-id"); })[0]); });
    });
    main.querySelectorAll(".stage .more").forEach(function (a) {
      a.addEventListener("click", function () { if (a.getAttribute("href") === location.hash) route(); });
    });
    var start = g.items.filter(function (x) { return x.id === itemId; })[0] || g.items[0];
    if (start) renderItem(g, start);
    if (itemId && start && start.id === itemId) { var b = $('.item-btn[aria-current="true"]'); if (b && b.scrollIntoView) b.scrollIntoView({ block: "nearest" }); }
  }

  function renderSummary() {
    markTab("summary");
    var main = $("#main");
    main.className = "wrap";
    main.innerHTML = '<section class="stepband" style="--step: var(--accent)"><div class="stepnum">◎</div><h1>Goals &amp; timeline</h1><p>' +
      esc(P ? P.goal : "") + "</p></section>" +
      '<div class="goals">' + (S.summary || []).map(function (s) {
        return '<article class="goal"><div class="stage-head"><div class="goal-name">' + esc(s.name) + "</div>" + OL.pill(s.status) + '</div><div class="goal-line">' + esc(s.line) + "</div></article>";
      }).join("") + "</div>" +
      '<h2 class="section">Recent milestones</h2><div class="timeline">' + (S.timeline || []).map(function (e) {
        return '<div class="trow"><span class="when">' + esc(e.t) + "</span><span>" + esc(e.text) + "</span></div>";
      }).join("") + "</div>";
    if (location.hash !== "#summary") history.replaceState(null, "", "#summary");
  }

  function route() {
    var parts = decodeURIComponent((location.hash || "").replace(/^#/, "")).split("/");
    if (parts[0] === "summary") return renderSummary();
    var st = steps.filter(function (s) { return s.id === parts[0]; })[0];
    if (st) return renderGroup(groupsById[st.groups[0]]);
    var g = groupsById[parts[0]] || groupsById[steps[0].groups[0]];
    renderGroup(g, parts[1]);
  }
  nav.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var tabs = Array.prototype.slice.call(nav.querySelectorAll("[data-step]"));
    var i = tabs.indexOf(document.activeElement); if (i < 0) return;
    var n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    n.focus(); n.click();
  });
  window.addEventListener("hashchange", route);
  route();
})();
