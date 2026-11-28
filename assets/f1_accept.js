/* Object-labelling acceptance board (F1's ACCEPTANCE_PLAN, by experiment priority). Rendered by catalog.js into #view
   when the "acceptance" sub-tab is open. Rows link to the catalog's asset drawer through data-go="assets:<id>". */
(function () {
  var D = window.F1_ACCEPT;
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var PRIO = { 1: "M1 称量", 2: "滴定稀释", 3: "已批准的 4 间基础实验室", 4: "其余 8 间基础实验室", 5: "论文自动搭建（色谱与进样）", 6: "其他资产" };
  var OWN = { DIRECTION_USER_REVIEW: "等你确认正面", REVIEW_PREPOPULATED_CANDIDATE: "预填朝向待复核", STATIC_OR_OTHER_COMBINED: "静置等多项", SUPPORT_OR_FIXTURE_AND_STATIC: "承托/夹具 + 静置", LINK_MASS_AND_FRONT: "补质量 + 正面", F1: "F1" };
  var SST = { PASS_STATIC_PROFILE: "通过", FAIL_STATIC_PROFILE: "未通过", NEEDS_FIXTURE: "需要夹具", PENDING_MASS_SOURCE: "缺质量来源", REVIEW_RUNTIME_OR_SOURCE: "待复核运行或源文件", REVIEW_SOURCE_COLLISION_DEFINITION: "待复核碰撞定义" };
  var CHK = { metric_dimensions_bottom_footprint: "尺寸与底面", semantic_upright_reference: "朝上", operating_front_reference: "正面", static_rest_pose: "静置", support_or_verified_fixture: "承托或夹具" };
  var OK = "#1f9d55", NO = "#d6336c", WAIT = "#f08c00", GREY = "#8a8f98";
  var chip = function (t, c, tip) { return '<span class="opst" style="--c:' + c + '"' + (tip ? ' title="' + esc(tip) + '"' : "") + ">" + esc(t) + "</span>"; };
  var f = { p: "", s: "", q: "" };

  function md(s) {
    var out = [], list = false;
    String(s || "").split("\n").forEach(function (l) {
      var t = l.trim();
      var li = /^(?:- |\d+\. )(.*)$/.exec(t);
      if (li) { if (!list) { out.push("<ul>"); list = true; } out.push("<li>" + esc(li[1]) + "</li>"); return; }
      if (list) { out.push("</ul>"); list = false; }
      if (!t || /^# /.test(t)) return;
      if (/^## /.test(t)) out.push("<h4>" + esc(t.slice(3)) + "</h4>"); else out.push("<p>" + esc(t) + "</p>");
    });
    if (list) out.push("</ul>");
    return out.join("");
  }
  function hrs(r) { return r ? (r[0] === r[1] ? r[0] : r[0] + "–" + r[1]) : "?"; }
  function pass(r) {
    if (f.p && String(r.p) !== f.p) return false;
    if (f.s === "static" && r.st) return false;
    if (f.s === "scene" && r.sc) return false;
    if (f.s === "user" && !r.pend.some(function (p) { return p[1] === "DIRECTION_USER_REVIEW" || p[1] === "LINK_MASS_AND_FRONT"; })) return false;
    if (f.s === "both" && !(r.st && r.sc)) return false;
    if (f.q && (r.name + " " + r.id).toLowerCase().indexOf(f.q) < 0) return false;
    return true;
  }
  function rowHtml(r) {
    var pend = r.pend.filter(function (p) { return p[0] !== "实体操作"; }), op = r.pend.filter(function (p) { return p[0] === "实体操作"; })[0];
    var miss = Object.keys(CHK).filter(function (k) { return r.chk[k] === false; }).map(function (k) { return CHK[k]; });
    return "<tr><td class=\"num\">" + esc(r.rank) + "</td>" +
      "<td>" + (r.th ? '<img class="f1a-th" loading="lazy" decoding="async" alt="" src="' + esc(r.th) + '">' : "") + "</td>" +
      '<td><a href="#assets/' + encodeURIComponent(r.id) + '" data-go="assets:' + esc(r.id) + '"><b>' + esc(r.name) + '</b></a><br><span class="muted small">' + esc(r.g) + " · " + esc(r.lvl || "—") + "</span></td>" +
      '<td class="small">' + esc(PRIO[r.p] || r.p) + "</td>" +
      "<td>" + (r.st ? chip("通过", OK) : chip(r.sst === "PASS_STATIC_PROFILE" ? "仅有 GPU 记录" : (SST[r.sst] || r.sst || "未通过"), r.sst === "PASS_STATIC_PROFILE" ? WAIT : NO, r.sf.join("；") || (r.sst === "PASS_STATIC_PROFILE" ? "只有 GPU 结果，还缺正式 CPU 原姿态静置" : ""))) + "</td>" +
      "<td>" + (r.sc ? chip("通过", OK) : chip("缺 " + (miss.join("、") || "?"), WAIT)) + "</td>" +
      "<td>" + (r.op ? chip("就绪", OK) : chip("未做", GREY, op ? op[2] : "")) + (r.tare ? ' <span class="muted small">软件去皮已接收</span>' : "") + "</td>" +
      '<td class="small">' + (pend.length ? pend.map(function (p) {
        return "<div><b>" + esc(p[0]) + "</b> · " + esc(OWN[p[1]] || p[1]) + ' <span class="muted">CPU ' + hrs(p[4]) + " 小时" + (p[5] && p[5][1] ? "，GPU " + hrs(p[5]) + " 卡时" : "") + '</span><div class="muted">' + esc(p[2]) + "</div></div>";
      }).join("") : '<span class="muted">静置和场景都已通过</span>') +
      (op ? '<div class="muted">实体操作：CPU ' + hrs(op[4]) + " 小时，GPU " + hrs(op[5]) + " 卡时 · " + esc(op[1]) + "</div>" : "") + "</td></tr>";
  }
  function table(box) {
    var rs = D.rows.filter(pass);
    box.querySelector("#f1a-n").textContent = rs.length + " / " + D.rows.length + " 件";
    box.querySelector("#f1a-body").innerHTML = rs.map(rowHtml).join("") || '<tr><td colspan="8" class="muted">没有符合条件的资产。</td></tr>';
  }

  function dirHtml() {
    var P = D.dir; if (!P || !P.items || !P.items.length) return "";
    var CONF = { high: ["把握大", OK], medium: ["把握中等", WAIT], low: ["约定或待定", GREY] };
    var ax = function (a) { return a === "rotationally_symmetric" ? "对称，不分正面" : a ? a + " 面" : ""; };
    var dl = P.created ? P.created.replace("T", " ").replace("Z", " UTC") : "";
    return '<h3 class="r2c-h" id="f1a-dir">正面方向：HQ 的提议 <span class="muted small">' + P.items.length + " 件 · " + esc(dl) + "</span></h3>" +
      '<p class="small">你 11-25 定的：由 HQ 看 F1 的六向视图给出每件的正面（以及要确认的朝上方向），F1 在一天后照此写入，除非你提出异议。每张卡片的大图是从提议的正面看过去的样子，小图是俯视图（图上方是 +Y，右边是 +X）。有不同意见直接告诉 HQ 编号和正确的面即可。</p>' +
      '<div class="f1a-dirgrid">' + P.items.map(function (x) {
        var c = CONF[x.conf] || CONF.low, prop = [];
        if (x.front) prop.push("正面：<b>" + esc(ax(x.front)) + "</b>");
        if (x.up) prop.push("朝上：<b>" + esc(x.up) + "</b>");
        if (!x.front && x.ctx) prop.push('<span class="muted">（正面已有：' + esc(ax(x.ctx)) + "）</span>");
        return '<figure class="f1a-dc"><div class="f1a-dimg">' + (x.img ? '<img loading="lazy" src="' + esc(x.img) + '" alt="' + esc(x.name) + '">' : "") + (x.top ? '<img class="f1a-dtop" loading="lazy" src="' + esc(x.top) + '" alt="俯视">' : "") + "</div>" +
          '<figcaption><span class="muted small">' + esc(x.doc) + '</span> <a href="#assets/' + encodeURIComponent(x.id) + '" data-go="assets:' + esc(x.id) + '"><b>' + esc(x.name) + "</b></a><br>" + prop.join(" · ") + " " + chip(c[0], c[1]) + '<div class="muted small">' + esc(x.why) + "</div></figcaption></figure>";
      }).join("") + "</div>";
  }
  function html() {
    if (!D) return '<p class="muted">验收看板数据还没有生成。</p>';
    var c = D.counts || {}, R = D.rows, n = c.assets || R.length;
    var tile = function (t, v, note, col) { return '<div class="f1a-tile"><span class="muted small">' + esc(t) + '</span><b class="num">' + v + '<small> / ' + n + '</small></b><i class="f1a-bar"><i style="width:' + (v / n * 100).toFixed(1) + "%;background:" + col + '"></i></i><span class="muted small">' + esc(note) + "</span></div>"; };
    var prios = Object.keys(PRIO).map(Number).filter(function (p) { return R.some(function (r) { return r.p === p; }); });
    var sceneGap = {}, userN = 0;
    R.forEach(function (r) { r.pend.forEach(function (p) { if (p[0] === "场景搭建") sceneGap[p[1]] = (sceneGap[p[1]] || 0) + 1; if (p[1] === "DIRECTION_USER_REVIEW" || p[1] === "LINK_MASS_AND_FRONT") userN++; }); });
    var s35 = D.static35 || {};
    return '<div class="f1a"><div class="block-head"><h2>物体标注验收看板</h2><p>F1 在 11-25 交的验收计划（' + esc(D.sha) + "）：267 件正式资产按实验需要排了先后，每件写明现在缺哪一级、要什么证据、下一步要多少 CPU 和 GPU 工作量。点名称打开这件资产的详细记录。</p></div>" +
      '<div class="f1a-tiles">' +
        tile("CPU 原姿态静置", c.CPU_static_formal || 0, "放在原来的姿态，960 步不倒、不滑", OK) +
        tile("场景搭建", c.strict_scene_A || 0, "尺寸、底面、朝上、正面、承托都已确认", "#2f6fdb") +
        tile("实体操作就绪", c.operation_ready || 0, "在原生物理里真的完成操作，并有独立评分", "#6c5ce7") +
        '<div class="f1a-tile"><span class="muted small">软件去皮</span><b class="num">' + esc(D.tare || 0) + '</b><span class="muted small">SPX2201 天平的去皮按软件接口单独接收</span></div>' +
      "</div>" +
      '<h3 class="r2c-h">按实验优先级</h3><div class="tscroll"><table class="cmp f1a-pt"><thead><tr><th>优先级</th><th>件数</th><th>静置通过</th><th>场景通过</th><th>实体操作就绪</th></tr></thead><tbody>' +
        prios.map(function (p) {
          var rs = R.filter(function (r) { return r.p === p; }), k = function (fn) { return rs.filter(fn).length; };
          return '<tr><td><a href="#accept" data-f1p="' + p + '">' + p + " · " + esc(PRIO[p]) + '</a></td><td class="num">' + rs.length + '</td><td class="num">' + k(function (r) { return r.st; }) + '</td><td class="num">' + k(function (r) { return r.sc; }) + '</td><td class="num">' + k(function (r) { return r.op; }) + "</td></tr>";
        }).join("") + "</tbody></table></div>" +
      '<p class="muted small">一件资产可能同时服务几条实验线，这里按它最靠前的那条计。优先级 5 的 4 件（1260 HPLC、1260 SFC、1290 GPC/SEC、8697）已经算在前面的房间里。</p>' +
      '<div class="f1a-gaps"><div><h4>场景搭建还差 ' + (n - (c.strict_scene_A || 0)) + " 件</h4><ul>" +
        Object.keys(sceneGap).sort(function (a, b) { return sceneGap[b] - sceneGap[a]; }).map(function (k) { return "<li><b>" + esc(OWN[k] || k) + "</b> " + sceneGap[k] + " 件</li>"; }).join("") + "</ul></div>" +
        "<div><h4>静置还差 " + (n - (c.CPU_static_formal || 0)) + " 件</h4><ul>" +
        Object.keys(s35).sort(function (a, b) { return s35[b] - s35[a]; }).map(function (k) { return "<li><b>" + esc(k === "PASS_STATIC_PROFILE" ? "仅有 GPU 记录" : (SST[k] || k)) + "</b> " + s35[k] + " 件" + (k === "PASS_STATIC_PROFILE" ? '<span class="muted">（原生 GPU 静置已通过，还缺正式 CPU 记录）</span>' : "") + "</li>"; }).join("") + "</ul>" +
        '<p class="muted small">其中 32 件用 SDF 碰撞体：CPU 会退化成三角网格，结果不算正式证据。F1 已提一个合并的原生 GPU 作业，等 F 线导师排期签批。</p></div>' +
        '<div class="f1a-you"><h4>需要你决定：' + userN + " 件的正面方向</h4><p class=\"small\">这些资产要先确认哪一面是“正面”（操作面），场景才能摆对方向。按你的决定，HQ 已经给出提议（见下面“正面方向：HQ 的提议”），没有异议就由 F1 写入。</p></div></div>" +
      dirHtml() +
      (D.summary_md ? '<details class="f1a-sum"><summary><b>F1 的说明和最新修复</b> <span class="muted small">试管架、旋光仪盖、真空泵按钮、仪器代理的修复层、进样器</span></summary>' + md(D.summary_md) + "</details>" : "") +
      '<h3 class="r2c-h">逐件清单</h3><div class="f1a-filters">' +
        '<label>优先级 <select id="f1a-p"><option value="">全部</option>' + prios.map(function (p) { return '<option value="' + p + '">' + p + " · " + esc(PRIO[p]) + "</option>"; }).join("") + "</select></label>" +
        '<label>状态 <select id="f1a-s"><option value="">全部</option><option value="static">静置未通过</option><option value="scene">场景未通过</option><option value="user">等你确认方向</option><option value="both">静置和场景都已通过</option></select></label>' +
        '<label>搜索 <input id="f1a-q" type="search" placeholder="名称或编号"></label><span class="muted small" id="f1a-n"></span></div>' +
      '<div class="tscroll"><table class="cmp f1a-t"><thead><tr><th>#</th><th></th><th>资产</th><th>优先级</th><th>静置</th><th>场景</th><th>实体操作</th><th>还缺什么 · 下一步工作量</th></tr></thead><tbody id="f1a-body"></tbody></table></div>' +
      '<p class="muted small">' + esc(D.est_note) + " 工作量是规划区间，不能逐件相加当预算。</p></div>";
  }
  function bind(box) {
    if (!D) return;
    var sp = box.querySelector("#f1a-p"), ss = box.querySelector("#f1a-s"), sq = box.querySelector("#f1a-q");
    sp.value = f.p; ss.value = f.s; sq.value = f.q;
    sp.addEventListener("change", function () { f.p = sp.value; table(box); });
    ss.addEventListener("change", function () { f.s = ss.value; table(box); });
    sq.addEventListener("input", function () { f.q = sq.value.trim().toLowerCase(); table(box); });
    box.querySelectorAll("[data-f1p]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); f.p = a.getAttribute("data-f1p"); sp.value = f.p; table(box); box.querySelector(".f1a-filters").scrollIntoView({ block: "start" }); }); });
    table(box);
  }
  window.F1ACC = { html: html, bind: bind, count: D ? D.rows.length : 0 };
})();
