/* Video-to-scene technical report: the HTML is rendered from Markdown at build time (tools/hq/build_v2s.py) and
   published encrypted as data/video2scene.js; this file only places it on the page. */
(function () {
  "use strict";
  var OL = window.OL, S = window.STATUS, d = window.OL_V2S, esc = OL.esc;
  var $ = function (sel) { return document.querySelector(sel); };
  OL.initTheme($("#themeBtn"));
  var steps = S && S.pipeline ? S.pipeline.steps : [];
  $("#tabs").innerHTML = '<a class="tab" href="agents.html">Plan &amp; progress</a><a class="tab" href="updates.html">进展快报</a><a class="tab" href="vanguard.html">先锋实验</a>' + steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" href="catalog.html">Assets &amp; scenes</a><a class="tab" aria-selected="true" href="real2sim.html">Real2sim</a><a class="tab" href="index.html#summary">Goals &amp; timeline</a>';
  var el = $("#v2s");
  if (!d || !d.html) { el.innerHTML = '<p class="muted">The report is not available.</p>'; $("#updated").textContent = "Video to scene"; return; }
  el.innerHTML = d.html;
  $("#updated").textContent = "Video to scene · technical report v2 · " + (d.updated || "");
})();
