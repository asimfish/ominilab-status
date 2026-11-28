/* updates.html — 进展快报: headline, key numbers, decisions for the owner, every lane's now/next, and a dated timeline.
   Data: window.HQ_UPDATES from data/hq_updates.json (tools/hq/build_updates.py). */
(function () {
  "use strict";
  var U = window.HQ_UPDATES, S = window.STATUS, OL = window.OL, esc = OL.esc;
  var $ = function (sel) { return document.querySelector(sel); };
  OL.initTheme($("#themeBtn"));

  var steps = S && S.pipeline ? S.pipeline.steps : [];
  $("#tabs").innerHTML = '<a class="tab" href="agents.html">Plan &amp; progress</a><a class="tab" aria-selected="true" href="updates.html">进展快报</a><a class="tab" href="vanguard.html">先锋实验</a>' + steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" href="catalog.html">Assets &amp; scenes</a><a class="tab" href="real2sim.html">Real2sim</a><a class="tab" href="index.html#summary">Goals &amp; timeline</a>';

  if (!U) { $("#updated").textContent = "进展数据加载失败。"; return; }

  // status: always an icon + a word, never colour alone
  var ST = { run: ["●", "进行中", "--run"], wait: ["◔", "等待中", "--idle"], block: ["▲", "卡住了", "--bad"], done: ["✓", "已完成", "--good"] };
  function chip(s) { var x = ST[s] || ST.wait; return '<span class="upd-st" style="--c:var(' + x[2] + ')"><i aria-hidden="true">' + x[0] + "</i>" + x[1] + "</span>"; }
  function meter(v, t) { var p = t ? Math.max(0, Math.min(100, v / t * 100)) : 0; return '<span class="upd-meter" role="img" aria-label="' + v + " / " + t + '"><i style="width:' + p.toFixed(1) + '%"></i></span>'; }
  function parseT(t) { var m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)Z$/.exec(t || ""); return m ? new Date(Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5])) : null; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function utc(d) { return pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()); }
  function bj(d) { var b = new Date(d.getTime() + 8 * 3600e3); return pad(b.getUTCHours()) + ":" + pad(b.getUTCMinutes()); }
  function day(d) { return (d.getUTCMonth() + 1) + " 月 " + d.getUTCDate() + " 日"; }
  function ago(d) { var m = Math.round((Date.now() - d.getTime()) / 60000); return m < 1 ? "刚刚" : m < 60 ? m + " 分钟前" : m < 48 * 60 ? Math.round(m / 60) + " 小时前" : Math.round(m / 1440) + " 天前"; }

  var up = parseT(U.updated_utc);
  $("#updated").textContent = "进展快报 · " + (up ? day(up) + " " + utc(up) + " UTC" : "");
  $("#upd-meta").innerHTML = up ? "更新于 <b>" + day(up) + " " + utc(up) + " UTC</b>（北京时间 " + bj(up) + "）· " + ago(up) : "";
  $("#upd-headline").textContent = U.headline || "";

  // key numbers
  $("#upd-kpis").innerHTML = U.kpis.map(function (k) {
    var big = k.big != null ? '<b class="upd-big">' + esc(k.big) + "</b>" : '<b class="upd-big">' + esc(k.value) + '<small> / ' + esc(k.total) + "</small></b>";
    var inner = '<div class="upd-kh"><span>' + esc(k.label) + "</span>" + chip(k.status) + "</div>" + big + (k.big == null ? meter(k.value, k.total) : '<span class="upd-meter upd-meter-none" aria-hidden="true"></span>') + '<p>' + esc(k.note || "") + "</p>";
    return k.link ? '<a class="upd-kpi" href="' + esc(k.link) + '">' + inner + "</a>" : '<div class="upd-kpi">' + inner + "</div>";
  }).join("");

  // decisions for the owner
  var dec = U.decisions || [];
  $("#upd-dec").innerHTML = dec.length ? '<div class="block-head"><h2>需要你决定的事</h2><p>现在就要你定的放在前面；“即将”是各条线正在准备方案、很快会来问你的。</p></div><div class="upd-decs">' + dec.map(function (x) {
    return '<div class="upd-decc ' + (x.kind === "now" ? "now" : "soon") + '"><span class="upd-dk">' + (x.kind === "now" ? "现在要定" : "即将") + "</span><h3>" + esc(x.title) + "</h3><p>" + esc(x.detail) + "</p>" +
      (x.due ? '<p class="upd-due">截止：' + esc(x.due) + "</p>" : "") + (x.link ? '<a href="' + esc(x.link) + '">去看 →</a>' : "") + "</div>";
  }).join("") + "</div>" : "";

  // lanes
  var counts = { run: 0, wait: 0, block: 0, done: 0 }, total = 0;
  U.areas.forEach(function (a) { a.lanes.forEach(function (l) { counts[l.status]++; total++; }); });
  $("#upd-lanes").innerHTML = '<div class="block-head"><h2>每条线现在在做什么</h2><p>' + total + " 个智能体：" + ["run", "wait", "block", "done"].filter(function (s) { return counts[s]; }).map(function (s) { return chip(s) + " " + counts[s]; }).join("　") + "</p></div>" +
    U.areas.map(function (a) {
      return '<h3 class="upd-area" id="lanes-' + esc(a.id) + '">' + esc(a.name) + '</h3><div class="upd-lanes">' + a.lanes.map(function (l) {
        var pg = l.progress ? '<div class="upd-lp">' + meter(l.progress.value, l.progress.total) + '<span class="num">' + esc(l.progress.value) + " / " + esc(l.progress.total) + " " + esc(l.progress.label || "") + "</span></div>" : "";
        return '<article class="upd-lane st-' + esc(l.status) + '"><header><div><h4>' + esc(l.name) + '</h4><span class="muted small">' + esc(l.who || "") + "</span></div>" + chip(l.status) + "</header>" + pg +
          '<dl><dt>现在</dt><dd>' + esc(l.now) + "</dd><dt>下一步</dt><dd>" + esc(l.next) + "</dd></dl>" + (l.link ? '<a class="upd-more" href="' + esc(l.link) + '">详情 →</a>' : "") + "</article>";
      }).join("") + "</div>";
    }).join("");

  // timeline, newest first, grouped by day
  var groups = [], last = "";
  (U.timeline || []).forEach(function (e) {
    var d = parseT(e.t); if (!d) return; var k = day(d);
    if (k !== last) { groups.push({ day: k, items: [] }); last = k; }
    groups[groups.length - 1].items.push({ d: d, tag: e.tag, text: e.text });
  });
  $("#upd-tl").innerHTML = groups.length ? '<div class="block-head"><h2>最近更新</h2><p>时间是 UTC，括号里是北京时间。</p></div>' + groups.map(function (g) {
    return '<h3 class="upd-day">' + esc(g.day) + '</h3><ol class="upd-tlist">' + g.items.map(function (x) {
      return '<li><time>' + utc(x.d) + '<small>（' + bj(x.d) + "）</small></time><span class=\"upd-tag\">" + esc(x.tag) + "</span><p>" + esc(x.text) + "</p></li>";
    }).join("") + "</ol>";
  }).join("") : "";
})();
