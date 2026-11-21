/* agents.html — plan & progress: steps at a glance, headline journey, roadmap of milestones, connection map. */
(function () {
  "use strict";
  var S = window.STATUS, OL = window.OL, esc = OL.esc;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  OL.initTheme($("#themeBtn"));
  var P = S && S.pipeline;
  if (!P) { $("#updated").textContent = "Plan data failed to load."; return; }
  $("#updated").textContent = "Plan & progress · updated " + P.updated + " (" + S.tz + ")";

  $("#tabs").innerHTML = '<a class="tab" aria-selected="true" href="agents.html">Plan &amp; progress</a>' + P.steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" href="catalog.html">Assets &amp; scenes</a><a class="tab" href="index.html#summary">Goals &amp; timeline</a>';
  $("#goal").textContent = P.goal;

  function stagesOf(step) { return P.stages.filter(function (st) { return st.step === step.id; }).sort(function (a, b) { return a.row - b.row; }); }
  function allMs(step) { var a = []; stagesOf(step).forEach(function (st) { a = a.concat(st.milestones || []); }); return a; }

  /* 1. steps at a glance */
  $("#glance").innerHTML = P.steps.map(function (s) {
    var m = allMs(s), c = OL.count(m);
    return '<article class="gcard ' + esc(s.id) + '"><div class="gtop"><span class="gnum">' + esc(s.n) + '</span><div><h2>' + esc(s.title) +
      '</h2><div class="gwhat">' + esc(s.what) + '</div></div></div>' +
      '<div class="gprog"><span class="gbig">' + c.done + "<small> of " + c.total + "</small></span><span>milestones done · " + c.now + " in progress</span></div>" +
      OL.segs(m) +
      '<dl class="gnn"><dt>Now</dt><dd>' + esc(s.now || "") + "</dd><dt>Next</dt><dd>" + esc(s.next || "") + "</dd></dl>" +
      '<a class="more" href="index.html#' + esc(s.groups[0]) + '">Step ' + esc(s.n) + " details →</a></article>";
  }).join("");

  /* 2. headline experiment */
  var H = P.headline;
  $("#journey").innerHTML = H ? '<div class="jhead"><span class="eyebrow">Headline experiment</span><h2>' + esc(H.title) + "</h2><p>" + esc(H.sub) + "</p></div>" + OL.track(H.stops, "big") : "";

  /* 3. roadmap */
  $("#roadmap").innerHTML = P.steps.map(function (s) {
    return '<section class="rstep ' + esc(s.id) + '"><div class="rstep-head"><span class="badge">' + esc(s.n) + "</span><h3>" + esc(s.title) + '</h3><span class="chip">Mentor: ' + esc(s.mentor) + "</span></div>" +
      stagesOf(s).map(function (st) {
        return '<div class="rrow"><div class="rinfo"><a class="rname" href="' + esc(OL.stageLink(st)) + '">' + esc(st.title) + "</a>" +
          OL.agent(st.agent, st.agent_state) + "</div>" + OL.track(st.milestones) + "</div>";
      }).join("") + "</section>";
  }).join("");

  $("#decisions").innerHTML = "<h2>Waiting on your decision</h2><ol>" + P.decisions.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>";

  /* 4. connection map: compact cards placed on a 3-column grid, links drawn in an SVG overlay */
  var html = "";
  P.steps.forEach(function (s, i) {
    html += '<div class="colhead ' + esc(s.id) + '" style="grid-column:' + (i + 1) + ';grid-row:1"><div class="ct"><span>' + esc(s.n) + "</span>" + esc(s.title) + "</div></div>";
    stagesOf(s).filter(function (st) { return st.map !== false; }).forEach(function (st) {
      var c = OL.count(st.milestones), now = (st.milestones || []).filter(function (m) { return m.s === "now"; }).map(function (m) { return m.t; });
      html += '<a class="node compact ' + esc(st.step) + " st-" + esc(st.status) + '" id="n-' + esc(st.id) + '" href="' + esc(OL.stageLink(st)) +
        '" style="grid-column:' + (st.col || i + 1) + ";grid-row:" + (st.row + 1) + '"><div class="stage-head"><div class="stage-title">' + esc(st.title) + "</div>" + OL.pill(st.status) + "</div>" +
        OL.agent(st.agent, st.agent_state) + OL.segs(st.milestones) +
        '<div class="nnow">' + c.done + " of " + c.total + " done" + (now.length ? " · now: " + esc(now.join(", ")) : "") + "</div></a>";
    });
  });
  $("#map").innerHTML = html + '<svg class="edges" id="edges" aria-hidden="true"></svg>';

  var NS = "http://www.w3.org/2000/svg";
  function box(id) {
    var el = document.getElementById("n-" + id);
    return el ? { l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight,
                  cx: el.offsetLeft + el.offsetWidth / 2, cy: el.offsetTop + el.offsetHeight / 2 } : null;
  }
  function mk(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function label(svg, text, x, y, anchor, kind) {
    if (!text) return;
    var t = mk("text", { x: x, y: y, "text-anchor": anchor || "middle", "dominant-baseline": "middle", "class": kind === "broken" ? "lbl-broken" : "lbl" });
    t.textContent = text; svg.appendChild(t);
    var bb = t.getBBox();
    svg.insertBefore(mk("rect", { "class": "lbg", x: bb.x - 4, y: bb.y - 2, width: bb.width + 8, height: bb.height + 4, rx: 4 }), t);
  }
  function draw() {
    var svg = $("#edges");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (window.matchMedia("(max-width: 900px)").matches) return;
    var defs = mk("defs", {});
    ["flow", "feed", "broken"].forEach(function (k) {
      var m = mk("marker", { id: "ah-" + k, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
      m.appendChild(mk("path", { d: "M0,0 L10,5 L0,10 z", "class": "ah-" + k })); defs.appendChild(m);
    });
    svg.appendChild(defs);
    var labels = [];
    P.links.forEach(function (ln) {
      var a = box(ln.from), b = box(ln.to);
      if (!a || !b) return;
      var lane = (ln.lane || 0) * 16, d, lx, ly, anchor = "middle";
      if (ln.route === "down") { d = "M" + a.cx + "," + a.b + " V" + (b.t - 2); lx = a.cx + 8; ly = (a.b + b.t) / 2; anchor = "start"; }
      else if (ln.route === "right") { var y = b.cy + lane; d = "M" + a.r + "," + y + " H" + (b.l - 2); lx = (a.r + b.l) / 2; ly = y - 11; }
      else if (ln.route === "gutter") { var gx = (a.r + b.l) / 2, y1 = b.cy + lane; d = "M" + a.r + "," + a.cy + " H" + gx + " V" + y1 + " H" + (b.l - 2); lx = gx; ly = (a.cy + y1) / 2; }
      else if (ln.route === "top") { var yt = Math.min(a.t, b.t) - 18; d = "M" + a.cx + "," + a.t + " V" + yt + " H" + b.cx + " V" + (b.t - 2); lx = (a.cx + b.cx) / 2; ly = yt; }
      else if (ln.route === "bottom") { var yb = Math.max(a.b, b.b) + 22; d = "M" + a.cx + "," + a.b + " V" + yb + " H" + b.cx + " V" + (b.b + 2); lx = (a.cx + b.cx) / 2; ly = yb; }
      else if (ln.route === "back") { var bx = a.l - 20, ya = a.t + a.h * 0.35, yb2 = b.t + b.h * 0.65; d = "M" + a.l + "," + ya + " H" + bx + " V" + yb2 + " H" + (b.l - 2); lx = bx - 8; ly = (ya + yb2) / 2; anchor = "end"; }
      else return;
      var kind = ln.kind === "feed" || ln.kind === "broken" ? ln.kind : "flow";
      svg.appendChild(mk("path", { d: d, "class": kind, "marker-end": "url(#ah-" + kind + ")" }));
      labels.push([ln.label, lx, ly, anchor, kind]);
    });
    labels.forEach(function (l) { label(svg, l[0], l[1], l[2], l[3], l[4]); });
  }
  var t;
  window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  draw();
})();
