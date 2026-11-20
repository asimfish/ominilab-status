/* agents.html — project map: three step columns of stage cards, with routed links drawn in an SVG overlay. */
(function () {
  "use strict";
  var S = window.STATUS, OL = window.OL, esc = OL.esc;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  OL.initTheme($("#themeBtn"));
  var P = S && S.pipeline;
  if (!P) { $("#updated").textContent = "Map data failed to load."; return; }
  $("#updated").textContent = "Updated " + P.updated + " (" + S.tz + ")";

  $("#tabs").innerHTML = '<a class="tab" aria-selected="true" href="agents.html">Project map</a>' + P.steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" href="index.html#summary">Goals &amp; timeline</a>';

  $("#goal").textContent = P.goal;
  $("#flow").innerHTML = P.flow.map(function (f) {
    return '<div class="flow-step ' + esc(f.status) + '"><span class="fl">' + esc(f.label) + '</span><span class="fs">' + esc(f.sub) + '</span><span class="fbar" aria-hidden="true"></span></div>';
  }).join("");
  $("#mentors").innerHTML = "<span>Mentors:</span>" + P.mentors.map(function (m) {
    return '<span class="chip" title="' + esc(m.note) + '"><b>' + esc(m.name) + "</b> · " + esc(m.covers) + "</span>";
  }).join("");
  $("#decisions").innerHTML = "<h2>Waiting on your decision</h2><ol>" + P.decisions.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ol>";

  /* columns and cards */
  var stepCol = {};
  var html = "";
  P.steps.forEach(function (s, i) {
    stepCol[s.id] = i + 1;
    html += '<div class="colhead ' + esc(s.id) + '" style="grid-column:' + (i + 1) + ';grid-row:1"><div class="ct"><span>' + esc(s.n) + "</span>" + esc(s.title) +
      '</div><div class="cw">' + esc(s.what) + '</div><div class="cm">Mentor: ' + esc(s.mentor) + "</div></div>";
    P.stages.filter(function (st) { return st.step === s.id; }).sort(function (a, b) { return a.row - b.row; }).forEach(function (st) {
      html += '<a class="node ' + esc(st.step) + " st-" + esc(st.status) + '" id="n-' + esc(st.id) + '" href="' + esc(OL.stageLink(st)) +
        '" style="grid-column:' + (st.col || i + 1) + ";grid-row:" + (st.row + 1) + '">' + OL.stageBody(st) + "</a>";
    });
  });
  var map = $("#map");
  map.innerHTML = html + '<svg class="edges" id="edges" aria-hidden="true"></svg>';

  /* links */
  var NS = "http://www.w3.org/2000/svg";
  function box(id) {
    var el = document.getElementById("n-" + id);
    return el ? { l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, r: el.offsetLeft + el.offsetWidth, b: el.offsetTop + el.offsetHeight,
                  cx: el.offsetLeft + el.offsetWidth / 2, cy: el.offsetTop + el.offsetHeight / 2 } : null;
  }
  function mk(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function label(svg, text, x, y, anchor, kind) {
    if (!text) return;
    var lines = String(text).split("\n");
    var t = mk("text", { x: x, y: y - (lines.length - 1) * 7, "text-anchor": anchor || "middle", "dominant-baseline": "middle", "class": kind === "broken" ? "lbl-broken" : "lbl" });
    lines.forEach(function (ln, i) { var s = mk("tspan", { x: x, dy: i ? 14 : 0 }); s.textContent = ln; t.appendChild(s); });
    svg.appendChild(t);
    var bb = t.getBBox();
    svg.insertBefore(mk("rect", { "class": "lbg", x: bb.x - 4, y: bb.y - 2, width: bb.width + 8, height: bb.height + 4, rx: 4 }), t);
  }
  function draw() {
    var svg = $("#edges");
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    if (window.matchMedia("(max-width: 900px)").matches) return;
    var defs = mk("defs", {});
    ["flow", "feed", "broken"].forEach(function (k) {
      var mkr = mk("marker", { id: "ah-" + k, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: "auto-start-reverse" });
      mkr.appendChild(mk("path", { d: "M0,0 L10,5 L0,10 z", "class": "ah-" + k }));
      defs.appendChild(mkr);
    });
    svg.appendChild(defs);
    var labels = [];
    P.links.forEach(function (ln) {
      var a = box(ln.from), b = box(ln.to);
      if (!a || !b) return;
      var lane = (ln.lane || 0) * 22, d, lx, ly, anchor = "middle";
      if (ln.route === "down") {
        d = "M" + a.cx + "," + a.b + " V" + (b.t - 2); lx = a.cx + 8; ly = (a.b + b.t) / 2; anchor = "start";
      } else if (ln.route === "right") {
        var y = b.cy + lane; d = "M" + a.r + "," + y + " H" + (b.l - 2); lx = (a.r + b.l) / 2; ly = y - 12;
      } else if (ln.route === "gutter") {
        var gx = (a.r + b.l) / 2, y1 = b.cy + lane;
        d = "M" + a.r + "," + a.cy + " H" + gx + " V" + y1 + " H" + (b.l - 2); lx = gx; ly = (a.cy + y1) / 2;
      } else if (ln.route === "top") {
        var yt = Math.min(a.t, b.t) - 20; d = "M" + a.cx + "," + a.t + " V" + yt + " H" + b.cx + " V" + (b.t - 2); lx = (a.cx + b.cx) / 2; ly = yt;
      } else if (ln.route === "bottom") {
        var yb = Math.max(a.b, b.b) + 24; d = "M" + a.cx + "," + a.b + " V" + yb + " H" + b.cx + " V" + (b.b + 2); lx = (a.cx + b.cx) / 2; ly = yb;
      } else if (ln.route === "back") {
        var bx = a.l - 22, ya = a.t + a.h * 0.35, yb2 = b.t + b.h * 0.65;
        d = "M" + a.l + "," + ya + " H" + bx + " V" + yb2 + " H" + (b.l - 2); lx = bx - 8; ly = (ya + yb2) / 2; anchor = "end";
      } else return;
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
