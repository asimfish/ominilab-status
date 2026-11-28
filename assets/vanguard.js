/* vanguard.html — 先锋实验直播控制台.
   Three views over the vanguard experiments:
   - 直播控制台 (console): an "on air" program monitor + a multiview wall (one preview monitor per experiment × channel:
     plan, scene 3D, collection, training, evaluation, full run) + a shared timeline + a merged live feed.
     Layout ideas from Foxglove (panel layouts), Rerun (one shared timeline) and LeRobot's dataset visualizer (episode video + plots).
   - 对比 (compare): both experiments side by side on one channel.
   - 十步详情 (detail): the 10 stages with their tables.
   Data: window.VANGUARD (data/vanguard.js), refreshed by polling data/vanguard.json every 60 s. */
(function () {
  "use strict";
  var V = window.VANGUARD, S = window.STATUS, OL = window.OL, esc = OL.esc;
  var $ = function (sel) { return document.querySelector(sel); };
  OL.initTheme($("#themeBtn"));
  var steps = S && S.pipeline ? S.pipeline.steps : [];
  $("#tabs").innerHTML = '<a class="tab" href="agents.html">Plan &amp; progress</a><a class="tab" href="updates.html">进展快报</a><a class="tab" aria-selected="true" href="vanguard.html">先锋实验</a>' + steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" href="catalog.html">Assets &amp; scenes</a><a class="tab" href="real2sim.html">Real2sim</a><a class="tab" href="index.html#summary">Goals &amp; timeline</a>';
  if (!V || !V.experiments || !V.experiments.length) { $("#updated").textContent = "先锋数据加载失败。"; return; }

  // ---------------- vocabulary ----------------
  var STAGE = {
    paper: ["论文与方案", "选一篇开放全文的论文，把实验写成机器人能执行的步骤"],
    scene: ["场景搭建", "在已批准的实验室里，用叠加层加上实验要用的东西，原场景不改"],
    assets: ["资产选择", "每一步用哪件资产：房间里原有的，还是叠加层新加的"],
    labels: ["资产标注", "关节和限位、药品位置、抓取点、操作名"],
    areas: ["原子任务区域", "把实验室分成工位：机器人站在哪、在那里做哪些原子任务"],
    scripted: ["脚本完整跑通", "先不用学习策略，用规划器把整个实验从头到尾跑一遍"],
    collect: ["数据采集", "每个技能用脚本示教，批量采集训练数据"],
    train: ["策略训练", "用 DP（扩散策略）学每个技能"],
    eval: ["单项评测", "每个技能单独测成功率"],
    fullrun: ["完整执行", "调度器按步骤调用学到的技能和移动，完整做一次实验"]
  };
  var CH = [["plan", "方案"], ["scene", "场景 3D"], ["collect", "采集"], ["train", "训练"], ["eval", "评测"], ["fullrun", "完整执行"]];
  var CHN = {}; CH.forEach(function (c) { CHN[c[0]] = c[1]; });
  var STAGE2CH = { paper: "plan", scene: "scene", assets: "scene", labels: "scene", areas: "scene", scripted: "fullrun", collect: "collect", train: "train", eval: "eval", fullrun: "fullrun" };
  var ST = { done: ["✓", "已完成", "--good"], run: ["●", "进行中", "--run"], todo: ["○", "未开始", "--idle"], block: ["▲", "卡住了", "--bad"] };
  var AST = { ok: ["正常", "--good"], stand_in: ["替身", "--warn"], missing: ["缺", "--bad"], done: ["已完成", "--good"], run: ["进行中", "--run"], todo: ["未开始", "--idle"], partial: ["部分", "--warn"], no: ["够不到", "--bad"] };
  var KIND = { ok: ["✓", "--good", "完成"], info: ["•", "--run", "进展"], warn: ["!", "--warn", "注意"], fail: ["✕", "--bad", "失败"] };
  var MCAT = { scripted: "脚本运行", collect: "数据采集", eval: "评测", fullrun: "完整执行", scene: "场景", labels: "标注", areas: "工位", train: "训练", assets: "资产" };
  var SCOL = ["--vs1", "--vs2", "--vs3", "--vs4"];   // stream identity colours (validated palette, light and dark)
  var ADDED = 0x1baf7a, USED = 0xeda100;              // 3D highlight: added = aqua, used = amber (not the stream colours)

  // ---------------- helpers ----------------
  function chip(s) { var x = ST[s] || ST.todo; return '<span class="upd-st" style="--c:var(' + x[2] + ')"><i aria-hidden="true">' + x[0] + "</i>" + x[1] + "</span>"; }
  function achip(s) { var x = AST[s]; return x ? '<span class="upd-st" style="--c:var(' + x[1] + ')">' + x[0] + "</span>" : esc(s || ""); }
  function meter(v, t) { var p = t ? Math.max(0, Math.min(100, v / t * 100)) : 0; return '<span class="upd-meter" role="img" aria-label="' + v + " / " + t + '"><i style="width:' + p.toFixed(1) + '%"></i></span>'; }
  function tms(t) { var m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)Z$/.exec(t || ""); return m ? Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) : null; }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function when(t) { var ms = tms(t); if (ms == null) return ""; var d = new Date(ms), b = new Date(ms + 8 * 3600e3); return (d.getUTCMonth() + 1) + "-" + d.getUTCDate() + " " + p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()) + " UTC（北京 " + p2(b.getUTCHours()) + ":" + p2(b.getUTCMinutes()) + "）"; }
  function hm(t) { var ms = tms(t); if (ms == null) return ""; var d = new Date(ms), b = new Date(ms + 8 * 3600e3); return p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()) + "<small>（" + p2(b.getUTCHours()) + ":" + p2(b.getUTCMinutes()) + "）</small>"; }
  function ago(t) { var ms = tms(t); if (ms == null) return ""; var n = Math.round((Date.now() - ms) / 60000); return n < 1 ? "刚刚" : n < 60 ? n + " 分钟前" : n < 2880 ? Math.round(n / 60) + " 小时前" : Math.round(n / 1440) + " 天前"; }
  function dur(ms) { var m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? m + " 分钟" : Math.floor(m / 60) + " 小时 " + (m % 60) + " 分"; }
  function done(e) { return e.stages.filter(function (s) { return s.status === "done"; }).length; }
  function current(e) { var c = e.stages.filter(function (s) { return s.status === "run" || s.status === "block"; })[0] || e.stages.filter(function (s) { return s.status !== "done"; })[0]; return c ? c.id : "fullrun"; }
  function stage(e, id) { return e.stages.filter(function (s) { return s.id === id; })[0] || { status: "todo" }; }
  function exps() { return V.experiments; }
  function byId(id) { return exps().filter(function (e) { return e.experiment === id; })[0]; }
  function scol(e) { var i = exps().map(function (x) { return x.experiment; }).sort().indexOf(e.experiment); return SCOL[i < 0 ? 0 : i % SCOL.length]; }
  function short(e) { return (e.owner || "").replace("先锋 ", "") || e.experiment.slice(0, 1).toUpperCase(); }
  function evs(e) { return ((e.live || {}).events || []).slice().sort(function (a, b) { return a.t < b.t ? 1 : -1; }); }
  function started(e) { var t = evs(e).map(function (x) { return tms(x.t); }).filter(function (x) { return x != null; }); return t.length ? Math.min.apply(null, t) : tms(e.updated_utc); }
  function ring(v, t, col, size) {
    var r = (size || 44) / 2 - 4, c = 2 * Math.PI * r, f = t ? v / t : 0, s = size || 44;
    return '<svg class="vc-ring" width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + " " + s + '" role="img" aria-label="' + v + " / " + t + '"><circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" class="tr"/><circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" class="fg" style="stroke:var(' + col + ')" stroke-dasharray="' + (c * f).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 ' + s / 2 + " " + s / 2 + ')"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle">' + v + "</text></svg>";
  }
  function media(e) {
    var lv = e.live || {}, out = (lv.media_wall || []).map(function (m) { return { file: m.file, caption: m.caption, cat: m.stage || "", result: m.result || "", primitive: m.primitive || "" }; });
    e.stages.forEach(function (s) { (s.media || []).forEach(function (m) { if (!out.some(function (x) { return x.file === m.file; })) out.push({ file: m.file, caption: m.caption, cat: s.id, result: "" }); }); });
    if (e.fullrun && e.fullrun.video && !out.some(function (x) { return x.file === e.fullrun.video; })) out.push({ file: e.fullrun.video, caption: "完整执行", cat: "fullrun", result: e.fullrun.status === "done" ? "ok" : "" });
    return out;
  }
  function isVid(f) { return /\.mp4$/i.test(f || ""); }
  function fig(m, big) {
    return '<figure class="vc-fig">' + (isVid(m.file) ? '<video muted playsinline controls preload="metadata" src="' + esc(m.file) + '"></video>' : '<a href="' + esc(m.file) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(m.file) + '" alt="' + esc(m.caption || "") + '"></a>') +
      "<figcaption>" + (m.result ? '<span class="upd-st" style="--c:var(' + (m.result === "ok" ? "--good" : "--bad") + ')">' + (m.result === "ok" ? "成功" : "失败") + "</span> " : "") + '<span class="muted">' + esc(MCAT[m.cat] || m.cat || "") + "</span> " + esc(m.caption || "") + "</figcaption></figure>";
  }
  function overview(e) {
    var im = media(e).filter(function (m) { return !isVid(m.file) && (m.cat === "scene" || m.cat === "areas"); })[0];
    return im ? im.file : "assets/scenes/" + e.room + "/overview.jpg";
  }
  function empty(t) { return '<p class="vc-empty">' + esc(t) + "</p>"; }

  // ---------------- charts ----------------
  function chart(curves, opt) {
    opt = opt || {};
    var keys = Object.keys(curves || {}).filter(function (k) { return curves[k].points.length > 1; }).slice(0, 4);
    if (!keys.length) return opt.spark ? "" : empty("训练开始后，这里实时显示每个技能的损失曲线。");
    var W = opt.spark ? 220 : 620, H = opt.spark ? 70 : 250, L = opt.spark ? 4 : 46, R = opt.spark ? 4 : 78, T = opt.spark ? 6 : 12, B = opt.spark ? 6 : 30, xs = [], ys = [];
    keys.forEach(function (k) { curves[k].points.forEach(function (p) { xs.push(p[0]); ys.push(p[1]); }); });
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y1 = Math.max.apply(null, ys) * 1.05, y0 = 0;
    var X = function (v) { return L + (v - x0) / ((x1 - x0) || 1) * (W - L - R); }, Y = function (v) { return T + (1 - (v - y0) / ((y1 - y0) || 1)) * (H - T - B); };
    var paths = keys.map(function (k, i) { return '<path class="s" style="stroke:var(--vs' + (i + 1) + ')" d="' + curves[k].points.map(function (p, j) { return (j ? "L" : "M") + X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join("") + '"/>'; }).join("");
    if (opt.spark) return '<svg class="vc-spark" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' + paths + "</svg>";
    var ticks = function (a, b, n) { var r = []; for (var i = 0; i <= n; i++) r.push(a + (b - a) * i / n); return r; };
    var f = function (v) { return v === 0 ? "0" : Math.abs(v) >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + "k" : Math.abs(v) >= 1 ? v.toFixed(1) : v.toFixed(Math.abs(v) >= 0.1 ? 2 : 3); };
    var ly = keys.map(function (k) { var p = curves[k].points; return Y(p[p.length - 1][1]); }), ord = ly.map(function (v, i) { return i; }).sort(function (a, b) { return ly[a] - ly[b]; });
    for (var oi = 1; oi < ord.length; oi++) { if (ly[ord[oi]] - ly[ord[oi - 1]] < 13) ly[ord[oi]] = ly[ord[oi - 1]] + 13; }
    var svg = '<svg class="van-chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="训练损失曲线">' +
      ticks(y0, y1, 4).map(function (v) { return '<line class="g" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/><text class="t" x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + f(v) + "</text>"; }).join("") +
      ticks(x0, x1, 4).map(function (v) { return '<text class="t" x="' + X(v) + '" y="' + (H - 10) + '" text-anchor="middle">' + f(v) + "</text>"; }).join("") + paths +
      keys.map(function (k, i) { var last = curves[k].points[curves[k].points.length - 1]; return '<text class="dl" x="' + (X(last[0]) + 6) + '" y="' + (ly[i] + 4) + '">' + esc(k) + "</text>"; }).join("") +
      '<line class="xh" y1="' + T + '" y2="' + (H - B) + '" x1="-10" x2="-10"/><rect class="hit" x="' + L + '" y="' + T + '" width="' + (W - L - R) + '" height="' + (H - T - B) + '"/></svg>';
    var legend = '<div class="van-legend">' + keys.map(function (k, i) { return '<span><i style="background:var(--vs' + (i + 1) + ')"></i>' + esc(k) + "</span>"; }).join("") + '<span class="muted small">横轴：训练步数；纵轴：损失</span></div>';
    return '<div class="van-chartbox" data-keys="' + esc(JSON.stringify(keys)) + '" data-geo="' + [L, R, W, x0, x1].join(",") + '">' + legend + svg + '<div class="van-tip" hidden></div></div>';
  }
  function bindCharts(root, getCurves) {
    root.querySelectorAll(".van-chartbox").forEach(function (cb) {
      var curves = getCurves(cb), keys = JSON.parse(cb.getAttribute("data-keys")), g = cb.getAttribute("data-geo").split(",").map(Number), svg = cb.querySelector("svg"), tip = cb.querySelector(".van-tip"), xh = svg.querySelector(".xh");
      var L = g[0], R = g[1], W = g[2], x0 = g[3], x1 = g[4], hit = svg.querySelector(".hit");
      hit.addEventListener("mousemove", function (ev) {
        var r = svg.getBoundingClientRect(), sx = (ev.clientX - r.left) / r.width * W, v = x0 + (sx - L) / (W - L - R) * (x1 - x0);
        xh.setAttribute("x1", sx); xh.setAttribute("x2", sx);
        tip.hidden = false; tip.style.left = Math.min(r.width - 170, Math.max(0, ev.clientX - r.left + 12)) + "px";
        tip.innerHTML = "<b>第 " + Math.round(v).toLocaleString() + " 步</b>" + keys.map(function (k, i) {
          var best = curves[k].points[0]; curves[k].points.forEach(function (p) { if (Math.abs(p[0] - v) < Math.abs(best[0] - v)) best = p; });
          return '<div><i style="background:var(--vs' + (i + 1) + ')"></i>' + esc(k) + "：" + best[1].toFixed(4) + "</div>";
        }).join("");
      });
      hit.addEventListener("mouseleave", function () { tip.hidden = true; xh.setAttribute("x1", -10); xh.setAttribute("x2", -10); });
    });
  }
  function evalBars(e) {
    var r = e.eval || [];
    if (!r.length) return empty("训练完成后，这里显示每个技能的成功率和 95% 置信区间。");
    return r.map(function (x) { if (!x.trials) return '<div class="van-evr"><b>' + esc(x.primitive) + "</b>" + pchip(x.status || "run") + '<span class="small">' + esc(x.note || "") + "</span></div>"; var p = x.trials ? x.success / x.trials : 0, w = x.wilson95 || [0, 0]; return '<div class="van-evr"><b>' + esc(x.primitive) + '</b><span class="van-ci"><i style="left:' + (w[0] * 100).toFixed(1) + "%;width:" + ((w[1] - w[0]) * 100).toFixed(1) + '%"></i><b style="left:' + (p * 100).toFixed(1) + '%"></b></span><span class="num">' + Math.round(p * 100) + "%（" + x.success + "/" + x.trials + "）</span></div>"; }).join("") + '<p class="muted small">竖线是成功率，浅色条是 95% 置信区间（Wilson）。</p>';
  }

  // F4's chain-level report (评测智能体): robot steps vs interface / check / stand-in steps, counted separately
  var ECAT = { robot_mobile: ["机器人（移动）", 1], robot_fixed: ["机器人（固定）", 1], robot_reach_unverified: ["机器人（可达未核）", 0], api_confirmed: ["接口（已确认）", 0], api_product: ["接口（产品级）", 0],
    api_panel_standin: ["接口（面板替身）", 0], check: ["判定", 0], human: ["人工", 0], move_standin: ["移动替身（瞬移）", 0], state: ["状态步骤（含快进）", 0], robot_work_standin: ["机器人操作替身", 0], unresolved: ["方式未定（预检拒绝）", 0], api_unconfirmed: ["接口未确认（预检拒绝）", 0] };
  var ESTAT = { SAMPLE_FROM_A_SCRIPTED_RUN: "脚本运行的基线（不是策略成绩）", PREVIEW: "预览", FINAL: "正式", UNDER_REVIEW: "⚠ 核查中：回放视频有误，结果暂不作数" };
  function chainHtml(e, compact) {
    var c = e.eval_chain; if (!c) return "";
    if (c.status === "VOIDED") return '<p class="van-void"><b>✗ 这份整链报告已作废</b>' + (c.hq_note ? "：" + esc(c.hq_note) : "") + "</p>";
    var h = c.headline || {}, ff = c.first_failure, cats = Object.keys(c.by_category || {});
    var ffs = !ff ? "无" : typeof ff === "string" ? ff : [ff.step_id || ff.step || ff.id, ff.skill || ff.primitive, ff.outcome, ff.reason || (ff.evidence_reasons || []).slice(0, 1).join("")].filter(Boolean).join(" · ");
    var m = '<div class="van-metrics"><span><small>机器人步骤首试通过</small><b>' + esc(h.robot_passed_first_attempt != null ? h.robot_passed_first_attempt : "—") + " / " + esc(h.robot_steps != null ? h.robot_steps : "—") + "</b></span>" +
      (h.robot_missing_no_evidence != null ? "<span><small>缺接触证据（记为缺失）</small><b>" + esc(h.robot_missing_no_evidence) + "</b></span>" : "") +
      "<span><small>整链（无干预）</small><b>" + (h.chain_completed_no_intervention ? "走完" : "没走完") + "</b></span><span><small>首次失败</small><b>" + esc(ffs) + "</b></span></div>";
    if (compact) return m;
    var rows = cats.map(function (k) { var x = c.by_category[k] || {}, n = ECAT[k] || [k, 0]; return "<tr><td>" + esc(n[0]) + '</td><td class="num">' + esc(x.steps) + '</td><td class="num">' + esc(x.passed) + '</td><td class="num">' + esc(x.failed) + '</td><td class="num">' + esc(x.missing) + "</td><td>" + (n[1] ? "✓ 计入" : '<span class="muted">另计</span>') + "</td></tr>"; });
    return '<div class="van-chain"><h4 class="van-h4">评测智能体的整链报告 <span class="muted small">F4 · ' + esc(ESTAT[c.status] || c.status) + (c.updated_utc ? " · " + esc(when(c.updated_utc)) : "") + "</span></h4>" + m +
      table(["步骤类别", "步数", "通过", "失败", "缺失", "计入机器人"], rows) + '<p class="muted small">只有机器人（移动、固定）的步骤算机器人能力；走仪器接口、判定和各种替身的步骤单独统计。主数字只看第一次尝试。报告 sha ' + esc(c.sha) + "。</p></div>";
  }

  // ---------------- detail view (十步详情) ----------------
  function stepper(e, clickable) {
    return '<ol class="van-steps">' + e.stages.map(function (s, i) {
      var x = ST[s.status] || ST.todo;
      return '<li class="st-' + esc(s.status) + '"><a href="#detail/' + esc(e.experiment) + "/" + esc(s.id) + '" data-go="detail/' + esc(e.experiment) + "/" + esc(s.id) + '"><span class="van-dot" style="--c:var(' + x[2] + ')" aria-hidden="true">' + (s.status === "done" ? "✓" : i + 1) + '</span><span class="van-sl">' + esc(STAGE[s.id][0]) + '</span><span class="sr">' + x[1] + "</span></a></li>";
    }).join("") + "</ol>";
  }
  function table(head, rows) { return rows.length ? '<div class="tscroll"><table class="cmp van-t"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.join("") + "</tbody></table></div>" : ""; }
  function extra(e, id) {
    if (id === "assets") return table(["", "资产", "用途", "数量", "来源", "位置", "状态"], (e.assets || []).map(function (a) {
      var nm = a.incat ? '<a href="catalog.html#assets/' + encodeURIComponent(a.id) + '">' + esc(a.name) + "</a>" : esc(a.name);
      return "<tr><td>" + (a.th ? '<img class="f1a-th" loading="lazy" alt="" src="' + esc(a.th) + '">' : "") + "</td><td>" + nm + '<br><code class="small">' + esc(a.id) + '</code></td><td class="small">' + esc(a.role) + '</td><td class="num">' + esc(a.count) + "</td><td>" + (a.source === "overlay" ? "叠加层新加" : "房间原有") + '</td><td class="small">' + esc(a.where) + "</td><td>" + achip(a.status) + (a.note ? '<div class="muted small">' + esc(a.note) + "</div>" : "") + "</td></tr>";
    }));
    if (id === "labels") return table(["资产", "标注内容", "状态"], (e.labels || []).map(function (l) { return '<tr><td><code class="small">' + esc(l.asset) + '</code></td><td class="small">' + esc(l.what) + (l.note ? '<div class="muted">' + esc(l.note) + "</div>" : "") + "</td><td>" + achip(l.status) + "</td></tr>"; }));
    if (id === "areas") return areasTable(e) + '<h4 class="van-h4">原子任务</h4>' + tasksTable(e);
    if (id === "collect") return taskPipe(e, "collect") + legacyCollect(e);
    if (id === "train") return taskPipe(e, "train") + trainTable(e);
    if (id === "eval") return chainHtml(e) + taskPipe(e, "eval") + ((e.eval || []).length ? evalBars(e) : "");
    if (id === "scripted") return scriptedRun(e);
    if (id === "fullrun") { var f = e.fullrun || {}; return f.steps_total ? '<div class="upd-lp">' + meter(f.steps_ok || 0, f.steps_total) + '<span class="num">' + esc(f.steps_ok || 0) + " / " + esc(f.steps_total) + " 步完成</span></div>" + (f.note ? '<p class="small">' + esc(f.note) + "</p>" : "") : ""; }
    return "";
  }
  function areasTable(e) {
    var tk = {}; (e.tasks || []).forEach(function (t) { tk[t.id] = t; });
    return table(["工位", "机器人站位", "在这里做的原子任务", "可达"], (e.areas || []).map(function (a) {
      return "<tr><td><b>" + esc(a.id) + '</b><div class="muted small">' + esc(a.name) + '</div></td><td class="small num">' + esc(a.base_pose || "—") + '</td><td class="small">' + (a.tasks || []).map(function (t) { return "<b>" + esc(t) + "</b> " + esc((tk[t] || {}).name || ""); }).join("<br>") + "</td><td>" + achip(a.reach) + (a.note ? '<div class="muted small">' + esc(a.note) + "</div>" : "") + "</td></tr>";
    }));
  }
  function tasksTable(e) {
    return table(["#", "任务", "工位", "技能", "执行方式", "成功判据"], (e.tasks || []).map(function (t) {
      return "<tr><td><b>" + esc(t.id) + "</b></td><td>" + esc(t.name) + '</td><td class="small">' + esc(t.area) + '</td><td class="small">' + esc(t.primitive) + "</td><td>" + (t.backend === "dp" ? "DP 策略" : "脚本") + '</td><td class="small muted">' + esc(t.success) + "</td></tr>";
    }));
  }
  function legacyCollect(e) { return (e.collect || []).length ? '<details class="van-legacy"><summary class="small">旧的采集（' + (e.task_chain ? "按技能、简化初态，没有按完整实验拆分" : "按技能") + "）</summary>" + collectTable(e) + "</details>" : ""; }
  function collectTable(e) { return table(["技能", "已采 / 目标", "", "示教成功率", "数据格式"], (e.collect || []).map(function (c) { return "<tr><td><b>" + esc(c.primitive) + '</b></td><td class="num">' + esc(c.episodes_ok) + " / " + esc(c.episodes_target) + '</td><td style="min-width:120px">' + meter(c.episodes_ok || 0, c.episodes_target || 0) + '</td><td class="num">' + esc(c.demo_success || "—") + '</td><td class="small">' + esc(c.dataset) + "</td></tr>"; })); }
  function trainTable(e) { return table(["技能", "配置", "步数", "用时", "卡时", "状态"], (e.train || []).map(function (t) { return "<tr><td><b>" + esc(t.primitive) + '</b></td><td class="small">' + esc(t.config) + '</td><td class="num">' + esc(t.steps != null ? Number(t.steps).toLocaleString() : "—") + '</td><td class="num">' + (t.wall_min != null ? esc(t.wall_min) + " 分钟" : "—") + '</td><td class="num">' + (t.gpu_h != null ? esc(t.gpu_h) : "—") + "</td><td>" + achip(t.status) + "</td></tr>"; })); }

  // ---------------- task pipeline (HQ 11-28): the complete experiment split into its tasks, each with collect → train → evaluate ----------------
  (function () {
    var css = ".van-pipe td,.van-pipe th{vertical-align:top}.van-pipe .fc{background:color-mix(in srgb,var(--run) 9%,transparent)}.van-pipe .nm b{display:block}.van-pipe .sk{font-size:12px;color:var(--muted,#667)}" +
      ".van-pipe .cell{display:grid;gap:2px}.van-pipe .note{font-size:12px;color:var(--muted,#667);line-height:1.35}.van-pipe tr.auto td{opacity:.72}" +
      ".van-film{display:grid;gap:10px}.van-film video{width:100%;max-width:100%;aspect-ratio:16/9;background:#000;border-radius:6px}.van-chap{list-style:none;margin:0;padding:0;display:grid;gap:4px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}" +
      ".van-chap li{display:flex;gap:8px;align-items:baseline;padding:6px 8px;border:1px solid var(--line,#ddd);border-radius:6px;font-size:13px}.van-chap li.on{border-color:var(--run);background:color-mix(in srgb,var(--run) 10%,transparent)}" +
      ".van-chap button{all:unset;cursor:pointer;display:flex;gap:8px;align-items:baseline;width:100%}.van-chap button:focus-visible{outline:2px solid var(--run);outline-offset:2px}.van-chap .t{font-variant-numeric:tabular-nums;color:var(--muted,#667);min-width:3.2em}" +
      ".van-pend{border:1px dashed var(--line,#ccc);border-radius:6px;padding:12px 14px;display:grid;gap:6px}";
    var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
  })();
  var PST = { done: ["✓ 完成", "--good"], run: ["● 进行中", "--run"], plan: ["◇ 已计划", "--warn"], todo: ["○ 未开始", "--idle"], na: ["— 不需要", "--idle"], block: ["▲ 卡住", "--bad"] };
  function pchip(s) { var x = PST[s] || PST.todo; return '<span class="upd-st" style="--c:var(' + x[1] + ')">' + x[0] + "</span>"; }
  function taskPipe(e, focus) {
    var tc = e.task_chain || {}, ts = tc.tasks || [];
    if (!ts.length) return empty("先锋还没把完整实验拆成任务表。");
    var fc = function (k) { return focus === k ? ' class="fc"' : ""; };
    var rows = ts.map(function (t, i) {
      var fr = t.fullrun || {}, c = t.collect || {}, lg = t.legacy || null, tr = t.train || {}, ev = t.eval || {};
      var frc = '<div class="cell">' + (fr.total ? '<span class="num">' + esc(fr.ok != null ? fr.ok : "…") + " / " + esc(fr.total) + " 行</span>" : "") + (fr.note ? '<span class="note">' + esc(fr.note) + "</span>" : "") + "</div>";
      var cc = '<div class="cell">' + pchip(c.status) + (c.target ? '<span class="num">' + esc(c.ok || 0) + " / " + esc(c.target) + " 条</span>" + meter(c.ok || 0, c.target) : "") + (c.note ? '<span class="note">' + esc(c.note) + "</span>" : "") +
        (lg ? '<span class="note">已有旧数据：' + esc(lg.ok) + " 条 · " + esc(lg.what) + "</span>" : "") + "</div>";
      var trc = '<div class="cell">' + pchip(tr.status) + (tr.note ? '<span class="note">' + esc(tr.note) + "</span>" : "") + "</div>";
      var evr = ev.n ? '<span class="num">' + esc(ev.k) + " / " + esc(ev.n) + (ev.ci ? "（95% 区间 " + Math.round(ev.ci[0] * 100) + "–" + Math.round(ev.ci[1] * 100) + "%）" : "") + "</span>" : "";
      var evc = '<div class="cell">' + pchip(ev.status) + evr + (ev.decision ? '<span class="note">判定：' + esc(ev.decision) + "</span>" : "") + (ev.note ? '<span class="note">' + esc(ev.note) + "</span>" : "") + "</div>";
      return '<tr class="' + (t.robot === false ? "auto" : "") + '"><td class="num">' + (i + 1) + '</td><td class="nm"><b>' + esc(t.name) + '</b><span class="sk">' + esc((t.skills || []).join(" · ")) + "</span></td><td" + fc("fullrun") + ">" + frc + "</td><td" + fc("collect") + ">" + cc + "</td><td" + fc("train") + ">" + trc + "</td><td" + fc("eval") + ">" + evc + "</td></tr>";
    });
    return '<div class="van-pipe"><h4 class="van-h4">完整实验拆成的任务 <span class="muted small">' + esc(tc.source || "") + "</span></h4>" + (tc.note ? '<p class="small">' + esc(tc.note) + "</p>" : "") +
      table(["#", "任务（按实验顺序）", "在完整实验里", "采集（按任务）", "训练", "评测（按任务）"], rows) + (tc.foot ? '<p class="muted small">' + esc(tc.foot) + "</p>" : "") + "</div>";
  }
  function fmtT(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + p2(s % 60); }
  function scriptedRun(e) {
    var r = e.scripted_run; if (!r) return "";
    var film = r.film || {}, chaps = film.chapters || [], parts = film.parts || (film.video ? [{ file: film.video, start_s: 0 }] : []);
    var head = '<div class="van-metrics"><span><small>脚本整链（' + esc(r.label || "") + '）</small><b>' + esc(r.rows_ok != null ? r.rows_ok : "…") + " / " + esc(r.rows_total) + ' 行</b></span>' +
      (r.robot_rows != null ? "<span><small>机器人步骤</small><b>" + esc(r.robot_rows) + "</b></span>" : "") + (r.standins != null ? "<span><small>替身</small><b>" + esc(r.standins) + "</b></span>" : "") +
      (r.f4 ? "<span><small>整链评测（F4）</small><b>" + esc(r.f4) + "</b></span>" : "") + (r.sim_min ? "<span><small>仿真时长</small><b>" + esc(r.sim_min) + " 分钟</b></span>" : "") + "</div>" + (r.note ? '<p class="small">' + esc(r.note) + "</p>" : "");
    var player = parts.length ? '<div class="van-film" data-film="' + esc(e.experiment) + '"><video controls playsinline preload="metadata" src="' + esc(parts[0].file) + '"></video>' +
      (chaps.length ? '<ol class="van-chap">' + chaps.map(function (c, i) { return '<li data-i="' + i + '"><button type="button" data-seek="' + esc(c.t) + '"><span class="t">' + fmtT(c.t) + "</span><span>" + esc(c.title) + "</span></button></li>"; }).join("") + "</ol>" : "") + "</div>" :
      '<div class="van-pend"><b>完整执行影片：' + esc(film.status_text || "还没有") + "</b>" + (chaps.length ? '<span class="small">影片会按下面的顺序一镜到底播完整条实验，每一章对应一个任务：</span><ol class="van-chap">' + chaps.map(function (c) { return "<li><span>" + esc(c.title) + "</span></li>"; }).join("") + "</ol>" : "") + "</div>";
    return '<div class="van-chain"><h4 class="van-h4">完整实验（脚本整链） ' + pchip(r.status) + "</h4>" + head + player + "</div>";
  }
  // one continuous film from several parts (each ≤16 MB): play them back to back, chapter list seeks across parts
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("[data-seek]"); if (!b) return;
    var box = b.closest(".van-film"), e = byId(box.getAttribute("data-film")); if (!e) return;
    filmSeek(box, e, +b.getAttribute("data-seek"));
  });
  function filmParts(e) { var f = (e.scripted_run || {}).film || {}; return f.parts || (f.video ? [{ file: f.video, start_s: 0 }] : []); }
  function filmSeek(box, e, t) {
    var ps = filmParts(e), v = box.querySelector("video"), k = 0;
    ps.forEach(function (p, i) { if (t >= p.start_s) k = i; });
    var go = function () { v.currentTime = Math.max(0, t - ps[k].start_s); v.play().catch(function () {}); };
    if (v.getAttribute("src") !== ps[k].file) { v.setAttribute("src", ps[k].file); v.addEventListener("loadedmetadata", go, { once: true }); v.load(); } else go();
  }
  document.addEventListener("ended", function (ev) {
    var v = ev.target; if (!v.closest || !v.closest(".van-film")) return;
    var box = v.closest(".van-film"), e = byId(box.getAttribute("data-film")); if (!e) return;
    var ps = filmParts(e), i = ps.map(function (p) { return p.file; }).indexOf(v.getAttribute("src"));
    if (i >= 0 && i + 1 < ps.length) { v.setAttribute("src", ps[i + 1].file); v.load(); v.play().catch(function () {}); }
  }, true);
  document.addEventListener("timeupdate", function (ev) {
    var v = ev.target; if (!v.closest || !v.closest(".van-film")) return;
    var box = v.closest(".van-film"), e = byId(box.getAttribute("data-film")); if (!e) return;
    var ps = filmParts(e), i = ps.map(function (p) { return p.file; }).indexOf(v.getAttribute("src")), t = (i >= 0 ? ps[i].start_s : 0) + v.currentTime;
    var ch = ((e.scripted_run || {}).film || {}).chapters || [], on = -1; ch.forEach(function (c, j) { if (t >= c.t) on = j; });
    box.querySelectorAll(".van-chap li").forEach(function (li) { li.classList.toggle("on", +li.getAttribute("data-i") === on); });
  }, true);
  function stageHtml(e, s, i) {
    var x = STAGE[s.id], open = s.status !== "todo";
    var body = (s.summary ? "<p>" + esc(s.summary) + "</p>" : "") +
      (s.metrics && s.metrics.length ? '<div class="van-metrics">' + s.metrics.map(function (m) { return "<span><small>" + esc(m[0]) + "</small><b>" + esc(m[1]) + "</b></span>"; }).join("") + "</div>" : "") +
      (s.media && s.media.length ? '<div class="van-media">' + s.media.map(function (m) { return fig({ file: m.file, caption: m.caption, cat: "" }); }).join("") + "</div>" : "") + extra(e, s.id) +
      (s.next ? '<p class="van-next"><b>下一步：</b>' + esc(s.next) + "</p>" : "");
    return '<details class="van-stage st-' + esc(s.status) + '" id="' + esc(e.experiment) + "-" + esc(s.id) + '"' + (open ? " open" : "") + '><summary><span class="van-n">' + (i + 1) + "</span><span class=\"van-sn\"><b>" + esc(x[0]) + '</b><small>' + esc(x[1]) + "</small></span>" + chip(s.status) + "</summary>" +
      '<div class="van-body">' + (body || '<p class="muted">还没开始。</p>') + (s.updated_utc && open ? '<p class="muted small">更新于 ' + esc(when(s.updated_utc)) + "</p>" : "") + "</div></details>";
  }
  function paperLine(e) { var p = e.paper || {}; return p.title ? '<p class="small">论文：<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.title) + "</a> · " + esc(p.authors) + (p.year ? "，" + esc(p.year) : "") + (p.license ? ' <span class="muted">（' + esc(p.license) + "）</span>" : "") + "</p>" : ""; }
  function detailHtml(e) {
    return '<nav class="subtabs vc-exptabs" role="tablist" aria-label="实验">' + exps().map(function (x) { return '<button type="button" class="subtab" data-go="detail/' + esc(x.experiment) + '" aria-current="' + (x === e) + '"><i class="vc-sw" style="background:var(' + scol(x) + ')"></i>' + esc(x.title) + "</button>"; }).join("") + "</nav>" +
      '<section class="van-exp"><div class="van-head"><div><h2>' + esc(e.title) + '</h2><p class="muted">' + esc(e.owner) + " · 实验室 " + esc(e.room) + " · 更新于 " + esc(when(e.updated_utc)) + "</p>" + paperLine(e) +
      '<p class="van-one">' + esc(e.one_line || "") + '</p></div><div class="van-prog"><b class="upd-big">' + done(e) + "<small> / 10</small></b><span class=\"muted small\">个阶段完成</span>" + meter(done(e), 10) + "</div></div>" + stepper(e) +
      e.stages.map(function (s, i) { return stageHtml(e, s, i); }).join("") + "</section>";
  }

  // ---------------- console pieces ----------------
  function streamCard(e) {
    var c = current(e), lv = e.live || {}, last = evs(e)[0], on = state.exp === e.experiment && state.view === "console";
    return '<button type="button" class="vc-stream" data-go="console/' + esc(e.experiment) + "/" + esc(state.ch) + '" aria-pressed="' + on + '" style="--sc:var(' + scol(e) + ')">' +
      ring(done(e), 10, scol(e), 52) + '<span class="vc-sbody"><span class="vc-sname"><span class="van-on" aria-hidden="true"></span><b>' + esc(e.title) + '</b></span><span class="muted small">' + esc(e.owner) + " · " + esc(e.room) + " · 已开工 " + esc(dur(Date.now() - started(e))) + '</span><span class="vc-snow">' + esc(lv.now || e.one_line || "") + '</span><span class="small">现在：<b>' + esc(STAGE[c][0]) + "</b> " + chip(stage(e, c).status) + (last ? ' <span class="muted">· 最近动态 ' + esc(ago(last.t)) + "</span>" : "") + "</span></span></button>";
  }
  function tile(e, ch) {
    var on = state.exp === e.experiment && state.ch === ch, body = "", lv = e.live || {}, md = media(e);
    if (ch === "plan") body = '<div class="vc-mini">' + e.stages.map(function (s) { return '<i class="st-' + esc(s.status) + '" title="' + esc(STAGE[s.id][0]) + '"></i>'; }).join("") + '</div><b class="vc-tbig">' + done(e) + "<small> / 10</small></b><span class=\"small\">" + esc(STAGE[current(e)][0]) + "</span>";
    else if (ch === "scene") body = '<img class="vc-thumb" loading="lazy" alt="" src="' + esc(overview(e)) + '" onerror="this.style.visibility=\'hidden\'"><span class="vc-badge">3D</span><span class="small">新加 ' + (lv.n_added || 0) + " · 要用 " + (lv.n_used || 0) + " · 站位 " + (lv.n_stations || 0) + "</span>";
    else if (ch === "collect" && e.task_chain) { var tl = (e.task_chain.tasks || []).filter(function (t) { return t.robot !== false; }), td = tl.filter(function (t) { return (t.collect || {}).status === "done"; }).length; body = '<b class="vc-tbig">' + td + "<small> / " + tl.length + " 个任务</small></b>" + meter(td, tl.length) + '<span class="small">按完整实验拆分的采集</span>'; }
    else if (ch === "collect") { var ok = 0, tg = 0; (e.collect || []).forEach(function (c) { ok += +c.episodes_ok || 0; tg += +c.episodes_target || 0; }); var cv = md.filter(function (m) { return isVid(m.file) && (m.cat === "collect" || m.cat === "scripted"); }).pop(); body = (cv ? '<video class="vc-thumb" muted playsinline preload="metadata" src="' + esc(cv.file) + '"></video>' : "") + '<b class="vc-tbig">' + ok + "<small> / " + tg + " 条</small></b>" + meter(ok, tg); }
    else if (ch === "train") { var sp = chart(lv.train_curves || {}, { spark: true }); body = sp ? sp + '<span class="small">' + Object.keys(lv.train_curves || {}).length + " 条曲线</span>" : '<span class="vc-none">还没开始</span>'; }
    else if (ch === "eval" && !(e.eval || []).some(function (r) { return r.trials; }) && (e.eval || []).some(function (r) { return r.status === "run"; })) { var hc0 = (e.eval_chain || {}).headline; body = '<span class="vc-tbig" style="font-size:20px">● 运行中</span><span class="small">' + esc((e.eval.filter(function (r) { return r.status === "run"; })[0] || {}).primitive) + (hc0 ? " · 整链 " + esc(hc0.robot_passed_first_attempt) + "/" + esc(hc0.robot_steps) : "") + "</span>"; }
    else if (ch === "eval") { var b = (e.eval || []).filter(function (r) { return r.trials; }).map(function (r) { return r.success / r.trials; }), hc = (e.eval_chain || {}).headline; body = b.length ? '<b class="vc-tbig">' + Math.round(Math.max.apply(null, b) * 100) + '%</b><span class="small">最好的技能 · 共 ' + b.length + " 个</span>" : hc ? '<b class="vc-tbig">' + esc(hc.robot_passed_first_attempt) + "<small> / " + esc(hc.robot_steps) + ' 步</small></b><span class="small">' + (e.eval_chain.status === "UNDER_REVIEW" ? "⚠ 核查中，暂不作数" : e.eval_chain.status === "VOIDED" ? "✗ 已作废，不作数" : "整链报告 · 脚本基线") + "</span>" : '<span class="vc-none">还没开始</span>'; }
    else if (ch === "fullrun" && e.scripted_run) { var sr = e.scripted_run; body = '<b class="vc-tbig">' + esc(sr.rows_ok != null ? sr.rows_ok : "…") + "<small> / " + esc(sr.rows_total) + " 行</small></b>" + meter(+sr.rows_ok || 0, +sr.rows_total || 0) + '<span class="small">脚本整链 · 影片' + esc(((sr.film || {}).parts || []).length || (sr.film || {}).video ? "已上墙" : "渲染中") + "</span>"; }
    else if (ch === "fullrun") { var f = e.fullrun || {}, fv = md.filter(function (m) { return isVid(m.file) && (m.cat === "fullrun" || m.cat === "scripted"); }).pop(); body = (fv ? '<video class="vc-thumb" muted playsinline preload="metadata" src="' + esc(fv.file) + '"></video>' : "") + '<b class="vc-tbig">' + (f.steps_ok || 0) + "<small> / " + (f.steps_total || 0) + " 步</small></b>" + meter(f.steps_ok || 0, f.steps_total || 0); }
    var st = ch === "plan" ? stage(e, current(e)).status : ch === "scene" ? stage(e, "scene").status : ch === "fullrun" ? (stage(e, "fullrun").status !== "todo" ? stage(e, "fullrun").status : stage(e, "scripted").status) : stage(e, ch).status;
    return '<button type="button" class="vc-tile st-' + esc(st) + '" data-go="console/' + esc(e.experiment) + "/" + ch + '" aria-pressed="' + on + '" style="--sc:var(' + scol(e) + ')"><span class="vc-th"><span>' + esc(CHN[ch]) + "</span>" + (on ? '<span class="vc-onair">播出中</span>' : '<i class="vc-dot" style="--c:var(' + (ST[st] || ST.todo)[2] + ')" title="' + (ST[st] || ST.todo)[1] + '"></i>') + '</span><span class="vc-tb">' + body + "</span></button>";
  }
  function program(e, ch, compact) {
    var lv = e.live || {}, md = media(e), sid = ch === "plan" ? current(e) : ch === "fullrun" ? "fullrun" : ch, s = stage(e, sid);
    var head = '<div class="vc-ph"><span class="vc-onair">● 直播</span><span class="vc-sw" style="background:var(' + scol(e) + ')"></span><b>' + esc(e.title) + '</b><span class="muted">· ' + esc(CHN[ch]) + "</span>" + chip(ch === "plan" ? s.status : stage(e, sid === "fullrun" && stage(e, "fullrun").status === "todo" ? "scripted" : sid).status) +
      (compact ? "" : '<span class="vc-pbtns"><button type="button" class="jchip" data-act="prev" title="上一个机位（←）">‹</button><button type="button" class="jchip" data-act="next" title="下一个机位（→）">›</button><button type="button" class="jchip" data-act="full" title="全屏（F）">⛶ 全屏</button></span>') + "</div>";
    var body = "";
    if (ch === "plan") {
      body = stepper(e) + '<div class="vc-plan"><div><h4>' + esc(STAGE[sid][0]) + " " + chip(s.status) + "</h4>" + (s.summary ? "<p>" + esc(s.summary) + "</p>" : "") +
        (s.metrics && s.metrics.length ? '<div class="van-metrics">' + s.metrics.map(function (m) { return "<span><small>" + esc(m[0]) + "</small><b>" + esc(m[1]) + "</b></span>"; }).join("") + "</div>" : "") + (s.next ? '<p class="van-next"><b>下一步：</b>' + esc(s.next) + "</p>" : "") + paperLine(e) + "</div>" +
        '<div><h4>原子任务</h4>' + ((e.tasks || []).length ? '<ol class="vc-tasks">' + e.tasks.map(function (t) { return '<li><b>' + esc(t.id) + "</b> " + esc(t.name) + ' <span class="muted small">' + esc(t.area) + " · " + (t.backend === "dp" ? "DP" : "脚本") + "</span></li>"; }).join("") + "</ol>" : empty("还没有任务表。")) + "</div></div>";
    } else if (ch === "scene") {
      body = compact ? '<img class="vc-big" loading="lazy" alt="" src="' + esc(overview(e)) + '" onerror="this.style.display=\'none\'"><p class="small muted">新加 ' + (lv.n_added || 0) + " 件 · 实验要用 " + (lv.n_used || 0) + " 件 · 机器人站位 " + (lv.n_stations || 0) + " 个。切到直播控制台可以看 3D。</p>" :
        (lv.room_url ? '<div class="vc-3dbar"><span class="van-3dleg"><span><i style="background:#1baf7a"></i>先锋新加</span><span><i style="background:#eda100"></i>实验要用的原有物件</span><span><i style="background:#b8bec8"></i>其他</span><span>机器人画在每个工位的站位上</span></span><span class="van-3dbtns"><button type="button" class="jchip" data-v3="op" aria-pressed="' + (v3mode === "op") + '">高亮</button><button type="button" class="jchip" data-v3="normal" aria-pressed="' + (v3mode !== "op") + '">原样</button><button type="button" class="jchip" data-v3="robots" aria-pressed="' + v3robots + '">机器人</button><button type="button" class="jchip" data-v3="area">回到实验区</button></span></div>' +
          '<div class="van-stage3d vc-3d" id="van-3d"><p class="van-3dmsg" id="van-3dmsg">正在加载 3D 场景…</p></div><p class="muted small" id="van-pick">拖动旋转，滚轮缩放，点物体看名字。' + (lv.scene3d && lv.scene3d.note ? " " + esc(lv.scene3d.note) : "") + "</p>" : empty("先锋交出场景坐标后，这里显示带新加物品和机器人站位的 3D 实验室。")) +
        (function () { var im = md.filter(function (m) { return ["scene", "areas", "labels", "assets"].indexOf(m.cat) >= 0; }); return im.length ? '<div class="vc-strip">' + im.map(function (m) { return fig(m); }).join("") + "</div>" : ""; })();
    } else if (ch === "collect") {
      var cv = md.filter(function (m) { return m.cat === "collect"; });
      body = taskPipe(e, "collect") + legacyCollect(e) + (cv.length ? '<div class="vc-wall">' + cv.slice().reverse().map(function (m) { return fig(m); }).join("") + "</div>" : "");
    } else if (ch === "train") {
      body = chart(lv.train_curves || {}) + taskPipe(e, "train") + trainTable(e);
    } else if (ch === "eval") {
      var ev = md.filter(function (m) { return m.cat === "eval"; });
      body = chainHtml(e) + taskPipe(e, "eval") + ((e.eval || []).length ? evalBars(e) : "") + (ev.length ? '<div class="vc-wall">' + ev.map(function (m) { return fig(m); }).join("") + "</div>" : "");
    } else if (ch === "fullrun") {
      var f = e.fullrun || {}, fv = md.filter(function (m) { return m.cat === "fullrun" || m.cat === "scripted"; });
      body = scriptedRun(e) + (f.note ? '<p class="small"><b>学到的技能做完整实验（V3）：</b>' + esc(f.note) + "</p>" : "") +
        (fv.length ? '<details class="van-legacy"><summary class="small">以前的分段片段（不是完整实验）</summary><div class="vc-wall">' + fv.slice().reverse().map(function (m) { return fig(m); }).join("") + "</div></details>" : "");
    }
    return '<section class="vc-prog" id="vc-prog" style="--sc:var(' + scol(e) + ')">' + head + '<div class="vc-pb">' + body + "</div></section>";
  }
  function timeline() {
    var all = []; exps().forEach(function (e) { evs(e).forEach(function (x) { var ms = tms(x.t); if (ms != null) all.push({ e: e, x: x, ms: ms }); }); });
    if (!all.length) return "";
    var t0 = Math.min.apply(null, all.map(function (a) { return a.ms; })) - 10 * 60000, t1 = Math.max(Date.now(), Math.max.apply(null, all.map(function (a) { return a.ms; }))) + 5 * 60000;
    var W = 1000, L = 96, R = 14, lane = 30, top = 8, H = top + exps().length * lane + 24, X = function (ms) { return L + (ms - t0) / (t1 - t0) * (W - L - R); };
    var ticks = [], step = (t1 - t0) > 8 * 3600e3 ? 3600e3 * 2 : (t1 - t0) > 3 * 3600e3 ? 3600e3 : 30 * 60000;
    for (var tt = Math.ceil(t0 / step) * step; tt <= t1; tt += step) ticks.push(tt);
    var svg = '<svg class="vc-tl" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="两路直播的共同时间线">' +
      ticks.map(function (tt) { var d = new Date(tt); return '<line class="g" x1="' + X(tt) + '" x2="' + X(tt) + '" y1="' + top + '" y2="' + (H - 20) + '"/><text class="t" x="' + X(tt) + '" y="' + (H - 6) + '" text-anchor="middle">' + p2(d.getUTCHours()) + ":" + p2(d.getUTCMinutes()) + "</text>"; }).join("") +
      exps().map(function (e, i) { var y = top + i * lane + lane / 2; return '<line class="ln" x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" style="stroke:var(' + scol(e) + ')"/><text class="lb" x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(e.title.split("（")[0].slice(0, 7)) + "</text>"; }).join("") +
      all.map(function (a) { var i = exps().indexOf(a.e), y = top + i * lane + lane / 2, k = KIND[a.x.kind] || KIND.info, ch = STAGE2CH[a.x.stage] || "plan"; return '<g class="ev" tabindex="0" data-go="console/' + esc(a.e.experiment) + "/" + ch + '" data-tip="' + esc(hm(a.x.t).replace(/<[^>]+>/g, " ") + " · " + a.e.title + "：" + a.x.text) + '"><circle cx="' + X(a.ms).toFixed(1) + '" cy="' + y + '" r="6" style="fill:var(' + k[1] + ')"/></g>'; }).join("") +
      '<line class="now" x1="' + X(Date.now()) + '" x2="' + X(Date.now()) + '" y1="' + (top - 4) + '" y2="' + (H - 20) + '"/><text class="nowt" x="' + X(Date.now()) + '" y="' + (top + 2) + '" text-anchor="end" dx="-4">现在</text></svg>';
    return '<section class="vc-panel vc-tlp"><h3>时间线 <span class="muted small">每个点是一条动态，颜色表示类型（' + ["ok", "info", "warn", "fail"].map(function (k) { return '<span class="vc-k"><i style="background:var(' + KIND[k][1] + ')"></i>' + KIND[k][2] + "</span>"; }).join(" ") + "）；点一下跳到相关机位</span></h3>" + svg + '<div class="vc-tltip" hidden></div></section>';
  }
  function feed() {
    var all = []; exps().forEach(function (e) { evs(e).forEach(function (x) { all.push({ e: e, x: x }); }); });
    all.sort(function (a, b) { return a.x.t < b.x.t ? 1 : -1; });
    return '<section class="vc-panel vc-feed"><h3>实时动态 <span class="muted small">两路合在一起，最新的在上</span></h3><ol>' + (all.length ? all.slice(0, 40).map(function (a) {
      var k = KIND[a.x.kind] || KIND.info, ch = STAGE2CH[a.x.stage] || "plan";
      return '<li><button type="button" data-go="console/' + esc(a.e.experiment) + "/" + ch + '"><span class="vc-who" style="--sc:var(' + scol(a.e) + ')">' + esc(short(a.e)) + '</span><span class="van-ek" style="--c:var(' + k[1] + ')" title="' + k[2] + '">' + k[0] + "</span><time>" + hm(a.x.t) + "</time><span class=\"vc-ft\">" + esc(a.x.text) + "</span></button></li>";
    }).join("") : '<li class="muted">还没有动态。</li>') + "</ol></section>";
  }
  function consoleHtml() {
    var e = byId(state.exp) || exps()[0];
    return '<div class="vc-streams">' + exps().map(streamCard).join("") + "</div>" +
      '<div class="vc-main">' + program(e, state.ch) + '<aside class="vc-wallgrid" aria-label="多路监看"><div class="vc-wh"><b>多路监看</b><span class="muted small">点任一画面切到主屏</span></div>' +
        exps().map(function (x) { return '<div class="vc-row" style="--sc:var(' + scol(x) + ')"><span class="vc-rl"><i class="vc-sw" style="background:var(' + scol(x) + ')"></i>' + esc(x.title.split("（")[0]) + '</span><div class="vc-tiles">' + CH.map(function (c) { return tile(x, c[0]); }).join("") + "</div></div>"; }).join("") + "</aside></div>" +
      timeline() + feed();
  }
  function compareHtml() {
    return '<div class="vc-cmpbar"><b>对比机位：</b>' + CH.map(function (c) { return '<button type="button" class="jchip" data-go="compare/' + c[0] + '" aria-pressed="' + (state.ch === c[0]) + '">' + esc(c[1]) + "</button>"; }).join("") + '</div><div class="vc-cmp">' + exps().map(function (e) { return program(e, state.ch, true); }).join("") + "</div>";
  }

  // ---------------- 3D (one viewer, on the program monitor) ----------------
  var v3mode = "op", v3robots = true, viewer = null, viewerKey = "", mod3d = null, framePts = null, applyTimer = null;
  function sceneKey(e) { return e.experiment + "|" + JSON.stringify((e.live || {}).scene3d || {}); }
  function applyMode() {
    if (!viewer) return;
    viewer.setMode(v3mode === "op" ? "op" : "model"); viewer.setRobots(v3robots);
    clearTimeout(applyTimer); applyTimer = setTimeout(function () { if (viewer) { viewer.setMode(v3mode === "op" ? "op" : "model"); viewer.setRobots(v3robots); } }, 4000);
  }
  function drop3d() { if (viewer) { try { viewer.dispose(); } catch (err) { /* already gone */ } } viewer = null; viewerKey = ""; framePts = null; }
  function mount3d(e) {
    var lv = e.live || {}, box = document.getElementById("van-3d"); if (!box || !lv.room_url) return;
    var key = sceneKey(e), msg = document.getElementById("van-3dmsg");
    (mod3d ? Promise.resolve(mod3d) : import(new URL("assets/viewer3d.js" + (window.OL_BUILD ? "?v=" + window.OL_BUILD : ""), document.baseURI).href)).then(function (m) {
      mod3d = m; viewerKey = key;
      var op = {}; ((lv.scene3d || {}).added || []).forEach(function (a) { op["+" + a.asset] = ADDED; });
      viewer = m.mountRoom(box, new URL(lv.room_url, document.baseURI).href, function (t) {
        if (msg) { msg.textContent = t || ""; msg.hidden = !t; }
        if (!t) { applyMode(); if (framePts && viewer && viewer.frame && !viewer.__framed) { viewer.frame(framePts); viewer.__framed = true; } }
      }, function (p) {
        var el = document.getElementById("van-pick"); if (!el) return;
        el.textContent = p ? "选中：" + String(p.name || p.id).replace(/^[+*]/, "") + (p.id && p.id.indexOf("station:") === 0 ? "（机器人工位 " + p.id.slice(8) + "）" : p.id && p.id[0] === "+" ? "（先锋新加）" : p.id && p.id[0] === "*" ? "（实验要用）" : "") : "拖动旋转，滚轮缩放，点物体看名字。";
      });
      fetch(new URL(lv.room_url, document.baseURI).href).then(function (r) { return r.json(); }).then(function (room) {
        var pts = [];
        (room.instances || []).forEach(function (x) { if (x.id[0] === "*") op[x.id] = USED; if (x.id[0] === "*" || x.id[0] === "+") pts.push(x.p); });
        (room.robots || []).forEach(function (r) { if (String(r.id).indexOf("station:") === 0) pts.push([r.m[12], 0.9, -r.m[13]]); });
        if (viewer) { viewer.setOpColours(op); applyMode(); framePts = pts; if (viewer.frame) viewer.frame(pts); }
      });
    });
  }

  // ---------------- state, routing, rendering ----------------
  var state = { view: "console", exp: exps()[0].experiment, ch: "plan", stage: "" };
  function parseHash() {
    var h = location.hash.replace(/^#/, "").split("/");
    if (h[0] === "compare") { state.view = "compare"; if (CHN[h[1]]) state.ch = h[1]; }
    else if (h[0] === "detail") { state.view = "detail"; if (byId(h[1])) state.exp = h[1]; state.stage = h[2] || ""; }
    else if (h[0] === "console" || !h[0]) { state.view = "console"; if (byId(h[1])) state.exp = h[1]; if (CHN[h[2]]) state.ch = h[2]; }
    else if (byId(h[0])) { state.view = "console"; state.exp = h[0]; }   // old links (#iodine_clock)
  }
  function setHash() { var h = state.view === "compare" ? "compare/" + state.ch : state.view === "detail" ? "detail/" + state.exp + (state.stage ? "/" + state.stage : "") : "console/" + state.exp + "/" + state.ch; history.replaceState(null, "", "#" + h); }
  var root = $("#van-body");
  function render(keep3d) {
    var latest = exps().map(function (e) { return e.updated_utc; }).sort().pop();
    $("#updated").textContent = "先锋实验 · " + when(latest);
    $("#van-meta").innerHTML = '<span class="van-on" aria-hidden="true"></span> ' + exps().length + " 路直播 · 数据更新于 " + esc(when(latest)) + " · 页面每分钟自动刷新，比现场晚约 5 分钟";
    document.querySelectorAll("#van-views [data-go]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-go").split("/")[0] === state.view)); });
    var e = byId(state.exp) || exps()[0];
    var reuse = keep3d && state.view === "console" && state.ch === "scene" && viewer && viewerKey === sceneKey(e) && document.getElementById("van-3d");
    var box3d = reuse ? document.getElementById("van-3d") : null;
    if (box3d) box3d.parentNode.removeChild(box3d); else drop3d();
    root.innerHTML = state.view === "compare" ? compareHtml() : state.view === "detail" ? detailHtml(e) : consoleHtml();
    if (box3d) { var nb = document.getElementById("van-3d"); if (nb) nb.replaceWith(box3d); }
    else if (state.view === "console" && state.ch === "scene") mount3d(e);
    bindCharts(root, function (cb) { var pr = cb.closest(".vc-prog"), ex = e; if (pr && state.view === "compare") { var idx = Array.prototype.indexOf.call(root.querySelectorAll(".vc-prog"), pr); ex = exps()[idx] || e; } return (ex.live || {}).train_curves || {}; });
    if (state.view === "detail" && state.stage) { var t = document.getElementById(state.exp + "-" + state.stage); if (t) { t.open = true; t.scrollIntoView({ block: "start" }); } }
  }
  function go(path) {
    var p = path.split("/");
    if (p[0] === "console") { state.view = "console"; if (byId(p[1])) state.exp = p[1]; if (CHN[p[2]]) state.ch = p[2]; }
    else if (p[0] === "compare") { state.view = "compare"; if (CHN[p[1]]) state.ch = p[1]; }
    else if (p[0] === "detail") { state.view = "detail"; if (byId(p[1])) state.exp = p[1]; state.stage = p[2] || ""; }
    setHash(); render(false);
    if (state.view !== "detail") { var pr = document.getElementById("vc-prog"); if (pr && pr.getBoundingClientRect().top < 0) pr.scrollIntoView({ block: "start" }); }
  }
  function stepCh(d) { var i = CH.map(function (c) { return c[0]; }).indexOf(state.ch); go("console/" + state.exp + "/" + CH[(i + d + CH.length) % CH.length][0]); }
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-go]");
    if (b) { ev.preventDefault(); go(b.getAttribute("data-go")); return; }
    var a = ev.target.closest("[data-act]");
    if (a) { var act = a.getAttribute("data-act"); if (act === "prev") stepCh(-1); else if (act === "next") stepCh(1); else if (act === "full") { var pr = document.getElementById("vc-prog"); if (pr && pr.requestFullscreen) pr.requestFullscreen(); } return; }
    var v = ev.target.closest("[data-v3]");
    if (v) {
      var k = v.getAttribute("data-v3");
      if (k === "area") { if (viewer && viewer.frame && framePts) viewer.frame(framePts); return; }
      if (k === "robots") { v3robots = !v3robots; v.setAttribute("aria-pressed", String(v3robots)); }
      else { v3mode = k; document.querySelectorAll("[data-v3=op],[data-v3=normal]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.getAttribute("data-v3") === k)); }); }
      applyMode();
    }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.target.closest && ev.target.closest("input,textarea,select") || ev.metaKey || ev.ctrlKey || ev.altKey || state.view !== "console") return;
    if (ev.key >= "1" && ev.key <= String(CH.length)) { go("console/" + state.exp + "/" + CH[+ev.key - 1][0]); }
    else if (ev.key === "ArrowRight") stepCh(1); else if (ev.key === "ArrowLeft") stepCh(-1);
    else if (ev.key === "s" || ev.key === "S") { var ids = exps().map(function (x) { return x.experiment; }); go("console/" + ids[(ids.indexOf(state.exp) + 1) % ids.length] + "/" + state.ch); }
    else if (ev.key === "f" || ev.key === "F") { var pr = document.getElementById("vc-prog"); if (pr && pr.requestFullscreen) pr.requestFullscreen(); }
    else if ((ev.key === "Enter" || ev.key === " ") && ev.target.closest && ev.target.closest("g.ev")) { go(ev.target.closest("g.ev").getAttribute("data-go")); }
  });
  // timeline tooltips
  document.addEventListener("mouseover", function (ev) {
    var g = ev.target.closest && ev.target.closest("g.ev"), tip = document.querySelector(".vc-tltip"); if (!tip) return;
    if (!g) { tip.hidden = true; return; }
    var p = tip.parentNode.getBoundingClientRect(), r = g.getBoundingClientRect();
    tip.textContent = g.getAttribute("data-tip"); tip.hidden = false;
    tip.style.left = Math.min(p.width - 300, Math.max(0, r.left - p.left - 20)) + "px"; tip.style.top = (r.bottom - p.top + 6) + "px";
  });

  // poll for new data (the service worker refreshes its manifest every 2 min); re-render in place, keeping the 3D view
  var lastTxt = JSON.stringify(V);
  setInterval(function () {
    fetch(new URL("data/vanguard.json", document.baseURI).href, { cache: "no-store" }).then(function (r) { return r.ok ? r.text() : null; }).then(function (t) {
      if (!t || t === lastTxt) return;
      lastTxt = t; V = JSON.parse(t);
      var y = window.scrollY; render(true); window.scrollTo(0, y);
      var m = $("#van-meta"); if (m) m.insertAdjacentHTML("beforeend", ' <b class="vc-new">· 刚收到新数据</b>');
    }).catch(function () {});
  }, 60000);

  parseHash(); render(false);
})();
