/* Real2sim: same-view comparison (source vs rebuild from the same camera), from data/r2s_pairs.js.
   v3 agent rebuilds (from 11-27) come first; v2 pixel-built shells are kept for comparison. */
(function () {
  var P = window.R2S_PAIRS, el = document.getElementById("r2pairs");
  if (!el || !P || !P.labs || !P.labs.length) return;
  var esc = window.OL ? window.OL.esc : function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var TYPE = { test: "已知真值", paper_image: "论文插图", photo: "网络照片", video: "实验室视频" };
  var st = { lab: 0, ver: 0, view: 0, mode: "side", swipe: 50 };
  function lab() { return P.labs[st.lab]; }
  function ver() { return lab().versions[st.ver] || null; }
  function pickVersion() {
    // v3 first; otherwise the accepted route that covers the most views
    var vs = lab().versions, best = 0, score = -1;
    vs.forEach(function (v, i) { var s = (v.kind === "v3" ? 1000 : 0) + (v.ok ? 100 : 0) + Object.keys(v.renders || {}).length * 2 + ({ "R2": 3, "R1": 1 }[(v.id || "").split("|")[1]] || 0); if (s > score) { score = s; best = i; } });
    st.ver = best;
  }
  function viewsWithRender() { var v = ver(); return lab().views.map(function (x, i) { return v && v.renders[x.cam] ? i : -1; }).filter(function (i) { return i >= 0; }); }

  function header() {
    var v3n = P.v3 || 0;
    return '<div class="block-head"><h2>同视角对比：原片 vs 我们的重建</h2>' +
      '<p>每一对图都来自同一个相机：左边是原始来源的画面，右边是我们重建的场景从同一视角渲染。可以切换"并排"和"滑动对比"；来源是视频的，下面还有同一路径的视频对比。</p></div>' +
      (v3n ? '<div class="r2p-note r2p-ok"><b>v3 代理重建：</b>' + v3n + ' 间已完成（测试房间 + 真实实验室）。每间可以看同视角对比、同路径视频、在线 3D，以及下面的流程和用时。' +
        '接下来：把占位方块换成资产库或开源资产（仪器要能操作）；每间出<b>完整版</b>和<b>房型版</b>两个版本；在线 3D 里可以删掉不需要的物件（例如椅子），据此生成新版本。</div>' : '<div class="r2p-note"><b>当前显示的是 v2：从像素直接重建房壳。</b> 效果差，房间是空的灰色壳加通用柜子，尺寸也偏差很大（测试房间真实 16 × 10 m，最快的路线量出 9.8 × 6.9 m）。' +
        '已经停止改进这条路。<b>11-27 起改用 v3 代理重建：</b>图片和视频只用来测房间和物体的尺寸、位置；代理逐帧认出每件设施和仪器，换成资产库或开源资产，再从同一视角对比修正（做法同 step 2 从论文图片建实验室）。' +
        '第一批（测试房间 + 1 间真实实验室）出来后会排在每间实验室的最前面。来源也在重新审计：太乱或信息不够的不再用。</div>');
  }
  var STAGE = {
    "1_intake_and_audit": ["来源审计与取帧", "给来源打分（覆盖、清晰、杂乱、尺度参照、许可），取关键帧，人脸打码"],
    "2_measure_geometry": ["测量", "相机位姿 + 米制深度 + BA：房间长宽高、墙门窗、大件的三维框"],
    "3_recognize_and_match": ["识别与配资产", "代理逐帧认出每件设施和仪器（带证据帧），换成资产库或开源资产"],
    "4_assemble_physics_usd": ["搭建", "按测量的尺寸位置组装 USD，配碰撞体和质量，导出网页 3D"],
    "5_strict_l0_verify": ["物理检查", "Isaac Sim 5.1 整房静置 660 步（strict L0）"],
    "6_rtx_render_views_video": ["同视角渲染", "从原片每个相机渲染同视角图，沿原片轨迹渲染同路径视频"],
    "7_visual_diff_and_compare": ["对比与修正", "同视角对比 + 客观对齐分数；对不上就回到识别、配资产修正"]
  };
  // ---- complete technical roadmap: how v3 continues the 11-21 survey, the 11-23 roadmap and report v2, and v2's five routes
  var NV3 = P.labs.filter(function (l) { return (l.versions || []).some(function (v) { return v.kind === "v3"; }); }).length;
  var STC = { done: ["#1f9d55", "已完成"], run: ["#2f7fd8", "进行中"], todo: ["#8a8f98", "未开始"], repl: ["#8e44ad", "已被取代"], part: ["#f08c00", "部分"] };
  function stc(k, t) { var c = STC[k] || STC.todo; return '<span class="opst" style="--c:' + c[0] + '">' + esc(t || c[1]) + "</span>"; }
  var INPUTS = [
    ["走动视频（网上公开或实拍）", "done", "v3 主线：" + NV3 + " 间已重建上墙（含测试房间）；新来源继续审计"],
    ["论文里的实验室图片（单张或多张）", "part", "step 2 已用论文图片和补充视频建出 CdS 量子点实验室；还没接进 v3 的验收流程"],
    ["网上照片（同一间的多张）", "part", "v2 试过 4 间；来源审计判定信息不够（视角少、局部特写），v3 暂不用"],
    ["iPhone 17 Pro Max 扫描（LiDAR / RoomPlan）", "todo", "原路线图的第 2 路；需要用户实拍，尺度可以直接从 LiDAR 拿到"]
  ];
  var LAYERS = [
    ["① 采集与来源审计", "原路线图：CaptureBundle（抽帧、去模糊、切镜头）", "done", "v3 加了来源打分：覆盖、清晰、人少、尺度参照、许可"],
    ["② 测量：相机位姿、米制尺度、房间和大件的三维框", "原路线图\u201c位姿与米制几何\u201d；v2 的 R1 / R2 / R5（DA3、MapAnything、BA、单图）", "done", "v2 用它直接做房壳，效果差；v3 只拿它测尺寸和位置"],
    ["③ 识别：代理逐帧认出每件设施和仪器（带证据帧）", "技术报告 v2 的 T1（按铭牌、按应有的操作匹配）；step 2 读图建实验室", "done", "LABSPEC v3，每项都引用证据帧"],
    ["④ 资产：T1 资产库按操作匹配 → T2 开源资产入库并加关节 → 参数化", "技术报告 v2 的 T1 / T2", "done", "已上线各间的大件占位全部换成资产库或开源资产；入库核对 0 缺口：11 间共 522/522 个非 cl:* 实例都对得上入库记录（226 条，含 30 种参数化台柜），6 件 CC-BY-NC 已标非商用并署名；等 F1 复核"],
    ["⑤ 组装：USD 场景、碰撞体、质量；零悬空、贴墙", "原路线图\u201c严格平整几何壳 + 硬物理门禁\u201d", "done", "房壳按测量生成，家具和仪器用资产"],
    ["⑥ 外观：材质取色；真实感 PBR 层；高斯外观孪生只作对照", "原路线图\u201c写实纹理烘焙\u201d；v2 的 R4", "part", "取色已做；真实感层还没上 v3"],
    ["⑦ 验证 T3：G1、strict L0、关节短测、可达", "技术报告 v2 的 T3 和 G1–G5", "part", "每间完整版、房型版、删改版都过了 5.1 strict L0；仪器关节短测都过 80%；可达性还没做"],
    ["⑧ 同视角对比 + 客观对齐分 → 修正循环", "v3 新增（用户 11-27 的要求）", "done", "对齐分阈值 0.45；对不上回到 ③④"],
    ["⑨ 输出：完整版 / 房型版 / 在线删改出的新版本；逐件 3D", "技术报告 v2 的\u201c两个版本\u201d（忠实孪生 / 可操作版）；用户 11-27", "done", "7 间真实实验室和 4 间真值房间都有逐件 3D；完整版、房型版、去掉椅子等删改版都能在网页上切换"],
    ["⑩ 进场景目录：场景等级 L1（功能卡）→ L2（正式稳定性）→ L3（可达、可操作）", "技术报告 v2 §2 场景等级", "todo", "验收通过后由 step 1 收进目录"]
  ];
  var TIERS = [
    ["快", "①②③④⑤：测量 + 资产库直接匹配 + 搭建，不渲染、不对比", "约 9 分钟（按现有用时估）"],
    ["中", "①–⑧ 全流程：加物理检查、同视角渲染、对比修正（现在每间都是这一档）", "实测 14–19 分钟，平均 16 分钟"],
    ["满", "中 + 开源资产入库并加关节、两个版本、关节短测、真实感层", "预计 1–2 小时，还没实测"]
  ];
  var MILES = [
    ["11-21 调研：七种扫描方案", "repl", "结论并进技术报告 v2"],
    ["11-23 原路线图（4 种输入 × 3 档速度）", "part", "输入层和速度档保留；\u201c从像素重建房壳 + 纹理\u201d那条主干被 v3 取代"],
    ["报告 M0：真值和评分器", "done", "4 间已批准房间的 GT 和评分器（11-23）；巡游视频已渲 15/24 段"],
    ["报告 M1：真值房间上达标（4 间里 ≥3 间）", "done", "4/4 间达标：房间误差 l0 4.4%、l1 1.6%、l2 0.6%、l3 0.6%（HQ 用真值独立复算过），实验台中心中位误差都 ≤0.21 m，大件召回 81–98%"],
    ["报告 M2：L1/L2 + 进搭建器", "part", "strict L0 已过（rc 版）；功能卡（L1）和正式平台运行还没做"],
    ["报告 M3：T2 关节", "run", "开源资产加关节、关节短测在做"],
    ["报告 M4：公开数据集分项评测", "repl", "改成直接用公开的真实实验室视频：" + (NV3 - 1) + " 间已做，新来源继续审计"],
    ["报告 M5：用户自己的实验室视频", "todo", "需要用户实拍，iPhone 扫描最好"],
    ["报告 M6：L3/L4 + 论文", "todo", "在可操作版里检查可达，跑原子任务"],
    ["11-24–26 v2：R1–R5 五条房壳路线", "repl", "房壳效果差，停了；测量部分（R1、R2）留在 v3 的 ② 里"],
    ["11-26 起 v3 代理重建", "run", NV3 + " 间上墙；验收进行中（见下表）"]
  ];
  var CRIT = ["来源", "尺度", "识别", "资产", "同视角", "同路径视频", "物理 L0", "可操作", "版本和网页", "记录"];
  function roadmap() {
    var rows = []; P.labs.forEach(function (l) { l.versions.forEach(function (v) { if (v.kind === "v3" && v.score) rows.push([l, v]); }); });
    var nPass = rows.filter(function (r) { return r[1].score.every(function (x) { return x[0] === "ok"; }); }).length;
    return '<details class="r2m" open><summary><h3 class="r2p-h">完整技术路线图：v3 和之前的计划是什么关系</h3></summary>' +
      '<p class="small">v3 不是另起炉灶。它保留了原路线图的<b>前端</b>（采集、测量）和技术报告 v2 的<b>后端</b>（验证、场景等级、两个版本），只把中间\u201c从像素直接重建房壳和纹理\u201d那一段（v2 的五条路线，效果差）换成了技术报告里本来就提出的 T1/T2：<b>代理识别 + 换成资产</b>。v2 的几何路线没有丢掉，变成了第 ② 层的测量工具。上面那张 7 步流程图只是 v3 的内层循环，下面是整张图。</p>' +
      '<h4 class="r2p-h">输入（原路线图的 4 路）</h4><div class="r2m-in">' + INPUTS.map(function (x) { return '<div class="r2m-card">' + stc(x[1]) + " <b>" + esc(x[0]) + '</b><div class="small muted">' + esc(x[2]) + "</div></div>"; }).join("") + "</div>" +
      '<h4 class="r2p-h">十层流程（每层写了来自哪个计划、现在的状态）</h4><div class="r2m-layers">' + LAYERS.map(function (x) {
        return '<div class="r2m-layer">' + stc(x[2]) + '<div><b>' + esc(x[0]) + '</b><div class="small"><span class="muted">来自：</span>' + esc(x[1]) + '</div><div class="small muted">' + esc(x[3]) + "</div></div></div>"; }).join('<div class="r2m-down" aria-hidden="true">↓</div>') + "</div>" +
      '<h4 class="r2p-h">速度档（原路线图的 3 档）</h4><div class="tscroll"><table class="cmp"><thead><tr><th>档</th><th>包含</th><th>用时</th></tr></thead><tbody>' + TIERS.map(function (t) { return "<tr><td><b>" + t[0] + "</b></td><td>" + esc(t[1]) + "</td><td>" + esc(t[2]) + "</td></tr>"; }).join("") + "</tbody></table></div>" +
      '<h4 class="r2p-h">原计划的里程碑现在走到哪</h4><div class="r2m-miles">' + MILES.map(function (m) { return '<div class="r2m-mile">' + stc(m[1]) + " <b>" + esc(m[0]) + '</b> <span class="small muted">' + esc(m[2]) + "</span></div>"; }).join("") + "</div>" +
      '<h4 class="r2p-h">验收记分板（标准 A1–A10，每间 10 项全过才算通过）</h4>' +
      '<div class="tscroll"><table class="cmp r2m-score"><thead><tr><th>实验室</th>' + CRIT.map(function (c, i) { return "<th>A" + (i + 1) + "<div class=\"small muted\">" + c + "</div></th>"; }).join("") + "</tr></thead><tbody>" +
        rows.map(function (r) { return "<tr><td>" + esc(r[0].title) + "</td>" + r[1].score.map(function (x) { return '<td><span class="r2m-dot r2m-' + x[0] + '"></span><span class="small">' + esc(x[1]) + "</span></td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>" +
      '<p class="small">通过 ' + nPass + " / " + rows.length + " 间。整体验收 4 条：① 已知真值测试房间 4 间里 ≥3 间达标：<b>已达到</b>，4/4（HQ 用真值复算）；② ≥4 间真实实验室 A1–A10 全过：<b>已达到</b>，7 间（Jeffries、Krogstad、George、Wang、Finno、Denmark、质谱间）；③ 换一间新实验室按同一流程跑通：<b>已达到</b>，Finno、Denmark、质谱间都是按 v3 同一流程新做的；更严格的“全自动、零人工改场景”一遍，A 的工具已在离线基准上跑通，第 4 间新实验室（核磁共振室）等云端对象存储恢复后跑；④ 开源资产入库记录齐全：<b>已达到</b>，0 缺口，等 F1 复核。</p>" +
      '<p class="small"><b>验收状态</b>：11 间全部 10/10，整体验收 4 条都已达到（11-28）。l1–l3 的删改版本（l1 去掉西侧架上 9 个试剂瓶，l2、l3 各去掉废纸桶）也通过了 5.1 strict L0。网页上被删的物件用红色标出；完整版里 228 台仪器可以像资产库一样操作。所有结果 formal=false，L0 用的是 5.1 rc.19。</p></details>';
  }
  function v3s() { var out = []; P.labs.forEach(function (l) { l.versions.forEach(function (v) { if (v.kind === "v3" && v.timing) out.push([l, v]); }); }); return out; }
  function flow() {
    var rows = v3s(); if (!rows.length) return "";
    var keys = Object.keys(STAGE), avg = {};
    keys.forEach(function (k) { var xs = []; rows.forEach(function (r) { r[1].timing.stages.forEach(function (st) { if (st[0] === k && st[1] != null) xs.push(st[1]); }); }); avg[k] = xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; });
    var mins = function (sec) { return sec == null ? "–" : sec < 60 ? Math.round(sec) + " 秒" : (sec / 60).toFixed(1) + " 分"; };
    var boxes = keys.map(function (k, i) {
      return '<div class="r2f-step"><span class="r2f-n">' + (i + 1) + "</span><b>" + esc(STAGE[k][0]) + '</b><span class="small">' + esc(STAGE[k][1]) + '</span><span class="r2f-t">平均 ' + mins(avg[k]) + "</span></div>" + (i < keys.length - 1 ? '<span class="r2f-arrow" aria-hidden="true">→</span>' : "");
    }).join("");
    var tot = rows.map(function (r) { return r[1].timing.wall_min; }).filter(function (x) { return x != null; });
    var table = '<div class="tscroll"><table class="cmp r2f-tab"><thead><tr><th>实验室</th>' + keys.map(function (k, i) { return "<th>" + (i + 1) + " " + esc(STAGE[k][0]) + "</th>"; }).join("") + "<th>合计</th><th>GPU 卡时</th></tr></thead><tbody>" +
      rows.map(function (r) {
        var m = {}; r[1].timing.stages.forEach(function (st) { m[st[0]] = st; });
        return "<tr><td>" + esc(r[0].title) + "</td>" + keys.map(function (k) { var st = m[k]; return '<td title="' + esc(st ? st[3] : "") + '">' + (st ? mins(st[1]) : "–") + "</td>"; }).join("") +
          "<td><b>" + (r[1].timing.wall_min != null ? r[1].timing.wall_min.toFixed(1) + " 分" : "–") + "</b></td><td>" + (r[1].timing.gpu_h != null ? r[1].timing.gpu_h.toFixed(2) : "–") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
    return '<div class="r2f"><h3 class="r2p-h">v3 技术流程：量 → 认 → 配 → 搭 → 查 → 比 → 改</h3>' +
      '<p class="small">图片和视频只用来<b>测量</b>房间和物体的尺寸、位置；设施和仪器由代理<b>识别</b>后换成资产库或开源资产，再从原片的同一视角对比、修正。</p>' +
      '<div class="r2f-flow">' + boxes + '</div><p class="muted small r2f-loop">⑦ 对不上的视角（对齐分低于 0.45）→ 回到 ③ 修正位置或换资产 → 重新 ④–⑦。</p>' +
      '<h4 class="r2p-h">每间实验室的重建用时（单遍，从原片到完成）</h4>' + table +
      '<p class="muted small">平均每间 ' + (tot.length ? (tot.reduce(function (a, b) { return a + b; }, 0) / tot.length).toFixed(1) : "–") + " 分钟。GPU 卡时只算实际占卡的时间；识别、配资产、对比修正主要是代理在看图，不占 GPU。鼠标移到格子上看这一步具体做了什么。</p></div>";
  }
  function labChips() {
    return '<div class="r2p-labs" role="tablist">' + P.labs.map(function (l, i) {
      var th = l.views[0] ? l.views[0].src : "";
      var hasV3 = l.versions.some(function (v) { return v.kind === "v3"; });
      return '<button type="button" class="r2p-lab" role="tab" data-lab="' + i + '" aria-selected="' + (i === st.lab) + '">' + (th ? '<img loading="lazy" src="' + esc(th) + '" alt="">' : "") +
        '<span><b>' + esc(l.title) + '</b><span class="muted small">' + esc(TYPE[l.type] || l.type || "") + " · " + l.views.length + " 个视角" + (hasV3 ? ' · <span class="r2p-v3tag">v3</span>' : "") + "</span></span></button>";
    }).join("") + "</div>";
  }
  function controls() {
    var l = lab();
    return '<div class="r2p-ctl"><label class="small">重建版本 <select id="r2p-ver">' + l.versions.map(function (v, i) {
      return '<option value="' + i + '"' + (i === st.ver ? " selected" : "") + ">" + esc(v.label) + (v.kind === "v2" ? (v.ok ? "" : "（清理未通过）") : "") + " · " + Object.keys(v.renders || {}).length + " 个视角</option>";
    }).join("") + '</select></label><span class="seg" role="group" aria-label="对比方式"><button type="button" data-mode="side" aria-pressed="' + (st.mode === "side") + '">并排</button><button type="button" data-mode="swipe" aria-pressed="' + (st.mode === "swipe") + '">滑动对比</button></span>' +
      '<span class="muted small">← → 切换视角</span></div>';
  }
  function stage() {
    var l = lab(), v = ver(), x = l.views[st.view];
    if (!x) return '<p class="muted">这间实验室还没有可对比的视角。</p>';
    var ren = v && v.renders[x.cam];
    var capL = "原片 · 视角 " + (st.view + 1) + (x.t != null ? " · t = " + Number(x.t).toFixed(1) + " s" : ""), capR = "重建 · 同一相机 · " + (v ? v.label : "");
    if (!ren) return '<div class="r2p-side"><figure><img src="' + esc(x.src) + '" alt=""><figcaption>' + esc(capL) + '</figcaption></figure><figure class="r2p-none"><div>这个版本在这个视角没有渲染</div><figcaption>' + esc(capR) + "</figcaption></figure></div>";
    if (st.mode === "swipe")
      return '<div class="r2p-swipe" id="r2p-swipe"><img src="' + esc(x.src) + '" alt="原片"><img class="r2p-top" src="' + esc(ren) + '" alt="重建" style="clip-path:inset(0 0 0 ' + st.swipe + '%)">' +
        '<div class="r2p-bar" style="left:' + st.swipe + '%"></div><span class="r2p-tl">原片</span><span class="r2p-tr">重建</span></div>' +
        '<input type="range" min="0" max="100" value="' + st.swipe + '" id="r2p-range" aria-label="滑动对比位置" class="r2p-range"><p class="muted small">' + esc(x.cap) + "</p>";
    return '<div class="r2p-side"><figure><img src="' + esc(x.src) + '" alt="原片"><figcaption>' + esc(capL) + '</figcaption></figure><figure><img src="' + esc(ren) + '" alt="重建"><figcaption>' + esc(capR) + "</figcaption></figure></div><p class=\"muted small\">" + esc(x.cap) + "</p>";
  }
  function strip() {
    var v = ver();
    return '<div class="r2p-strip">' + lab().views.map(function (x, i) {
      var has = v && v.renders[x.cam];
      return '<button type="button" class="r2p-th' + (has ? "" : " r2p-thno") + '" data-view="' + i + '" aria-pressed="' + (i === st.view) + '" title="' + esc(x.cap) + (has ? "" : "（这个版本没有这个视角的渲染）") + '"><img loading="lazy" src="' + esc(x.src) + '" alt=""><span>' + (i + 1) + "</span></button>";
    }).join("") + "</div>";
  }
  function videos() {
    var v = ver(); if (!v) return "";
    if (v.videos && v.videos.length)
      return '<h3 class="r2p-h">同一路径的视频对比</h3>' + v.videos.map(function (p, i) {
        return '<div class="r2p-vpair" data-vp="' + i + '"><figure><video playsinline muted preload="metadata" src="' + esc(p.src) + '"></video><figcaption>原片</figcaption></figure><figure><video playsinline muted preload="metadata" src="' + esc(p.ren) + '"></video><figcaption>重建 · 沿原片相机轨迹渲染</figcaption></figure></div>' +
          '<div class="r2p-vctl"><button type="button" class="tgl" data-vplay="' + i + '">▶ 同步播放</button><input type="range" min="0" max="1000" value="0" data-vseek="' + i + '" aria-label="进度"><span class="muted small" data-vtime="' + i + '"></span></div>';
      }).join("");
    if (v.video_pair) return '<h3 class="r2p-h">同一路径的视频对比</h3><video class="r2p-vone" controls playsinline preload="metadata" src="' + esc(v.video_pair) + '"></video><p class="muted small">左：原片巡游视频；右：这条路线的重建，沿同一相机路径渲染。</p>';
    return '<p class="muted small r2p-h">同一路径的视频对比：' + (lab().type === "video" || lab().type === "test" ? "v2 这条路线没有。v3 会沿原片相机轨迹渲染，和原片同步并排播放。" : "这间实验室的来源是图片，没有视频。") + "</p>";
  }
  // ---- online 3D: versions (full / base / user-made) and removing objects to request a new version
  var ed = { on: false, removed: {}, sel: null, variant: 0, viewer: null, mod: null, key: "", ghost: true, op: false, opSel: null, art: {}, opMsg: "" };
  // 11-28 (user): operating instruments like the asset library. Joint names and groups follow catalog.js.
  function jname(n) {
    var t = String(n).replace(/^Joint_/, "").replace(/_(joint|slide|hinge)$/i, ""), parts = t.split("_");
    if (parts.length > 1 && /^[A-Za-z]+\d{2,}$/.test(parts[0])) parts.shift();
    t = parts.join(" ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\bbtn\b/gi, "button").replace(/([A-Za-z])0*(\d+)\b/g, "$1 $2").replace(/\s+/g, " ").trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : String(n);
  }
  var ZHPART = { button: "按钮", switch: "开关", knob: "旋钮", door: "门", lid: "盖", drawer: "抽屉", handle: "把手", latch: "门闩", cover: "盖板", tray: "托盘", key: "按键", sash: "移门", valve: "阀", dial: "拨盘", hatch: "舱门", window: "窗", panel: "面板", rotor: "转子", arm: "臂", stage: "载物台", clamp: "夹" };
  function zhPart(raw) { var t = jname(raw), m = /^([A-Za-z]+)\s*(\d*)\s*(.*)$/.exec(t); if (m && ZHPART[m[1].toLowerCase()]) return ZHPART[m[1].toLowerCase()] + (m[2] ? " " + m[2] : "") + (m[3] ? "（" + m[3] + "）" : ""); return t; }
  var JGROUPS = [["access", "开关门、盖、抽屉", /door|lid|hatch|cover|flap|window|sash|drawer|tray|gate|cap|shield|hood|panel|bezel/i], ["adjust", "旋钮、阀、门闩", /knob|dial|valve|clamp|lever|screw|lock|latch|thumb|regulat/i],
    ["control", "按钮和开关", /button|switch|key|power|start|stop|trigger|toggle|pedal|touch|mains/i], ["mech", "转子、载物台、机械臂等", /rotor|spindle|arm|stage|shaker|platform|head|carriage|plunger|piston|pump|drive|motor|slide|press|lift/i]];
  function jgroup(n) { for (var i = 0; i < JGROUPS.length; i++) if (JGROUPS[i][2].test(n)) return i; return JGROUPS.length; }
  function jfull(j) { if (j.free) return j.type === "revolute" ? 90 : 0; var lo = j.lo == null ? 0 : j.lo, hi = j.hi == null ? 0 : j.hi; return Math.abs(hi) >= Math.abs(lo) ? hi : lo; }
  function jfunc(j) { var t = Math.abs(jfull(j)); return !j.loop && j.links.length > 0 && !/foot|feet|level|caster|wheel_base|_height$/i.test(j.name) && (j.type === "revolute" ? t >= 3 : t >= 0.004); }
  var TIERNAME = { shell: "房间外壳", support: "实验台和柜", large: "大件仪器", instrument: "仪器", small: "小物件", tool: "工具和耗材", furniture: "家具", robot: "机器人" };
  function variantsOf(v) {
    var list = (v.variants || []).slice();
    if (!list.length && v.glb) list.push({ id: "full", label: "完整版", glb: v.glb, removed: [] });
    return list;
  }
  function hideOf(x) {   // a version = the full per-object scene with these objects hidden (its own L0 is shown on the button)
    var out = {}; ((x && x.hide) || []).forEach(function (id) { out[id] = 1; }); return out;
  }
  function basePreview(v) {   // until A delivers the official base version: keep benches and large items, drop the rest
    var out = {};
    (v.inventory || []).forEach(function (r) {
      var tier = r[5] || "", big = (r[6] || 0) >= 0.6, chair = /椅|chair/i.test(r[0] + r[1]);
      var keep = tier === "support" || tier === "shell" || tier === "large" || ((tier === "instrument" || tier === "furniture") && big && !chair);
      if (!keep && r[4]) out[r[4]] = 1;
    });
    return out;
  }
  function threeD() {
    var v = ver(); if (!v || v.kind !== "v3") return "";
    var vs = variantsOf(v); if (!vs.length) return "";
    var cur = vs[Math.min(ed.variant, vs.length - 1)];
    var hasBase = vs.some(function (x) { return x.id === "base"; });
    var nRem = Object.keys(ed.removed).length;
    return '<h3 class="r2p-h">在线 3D：重建出来的场景</h3>' +
      '<div class="r2d-bar"><span class="seg" role="group" aria-label="版本">' + vs.map(function (x, i) {
        return '<button type="button" data-var="' + i + '" aria-pressed="' + (x === cur) + '">' + esc(x.label) + (x.l0 ? " · L0 " + esc(x.l0[0]) : "") + "</button>"; }).join("") +
        (hasBase ? "" : '<button type="button" data-var="preview" aria-pressed="false" title="正式的房型版由 A 生成；这里先在网页上按规则隐藏小物件预览">房型版（预览）</button>') + "</span>" +
        '<button type="button" class="tgl" data-cut aria-pressed="true">顶棚切开</button>' +
        '<button type="button" class="tgl" data-edit aria-pressed="' + ed.on + '">删改物件' + (nRem ? "（已去掉 " + nRem + " 件）" : "") + "</button>" +
        ((v.ops || []).length ? '<button type="button" class="tgl" data-op aria-pressed="' + ed.op + '" title="像资产库一样操作仪器：开关门、盖、抽屉，转旋钮">操作仪器（' + v.ops.length + " 台）</button>" : "") +
        '<button type="button" class="tgl" data-ghost aria-pressed="' + ed.ghost + '" title="这个版本删掉的物件：用红色半透明标出来，或者直接隐藏">被删物件：' + (ed.ghost ? "红色标出" : "隐藏") + "</button></div>" +
      '<p class="small r2d-rm" id="r2d-rm">' + rmNote(v) + "</p>" +
      '<div class="r2d-wrap"><div class="r2d-stage" id="r2d-stage"><div class="r2d-views" id="r2d-views"></div><p class="r2d-msg" id="r2d-msg">点"打开 3D"加载（' + esc(String(v.glb ? "" : "")) + '约 5–12 MB）</p><span class="r2d-hud small" id="r2d-hud"></span>' +
        '<button type="button" class="tgl r2d-open" id="r2d-open">打开 3D</button></div>' +
        (ed.on ? '<div class="r2d-side" id="r2d-side">' + editPanel(v) + "</div>" : ed.op ? '<div class="r2d-side" id="r2d-side">' + opPanel(v) + "</div>" : "") + "</div>" +
      '<p class="muted small" id="r2d-note">拖动旋转，滚轮缩放，右键平移。' + (ed.on ? "在 3D 里点一件物体选中它，再点\u201c去掉\u201d；或在右侧清单里勾选。被去掉的物件用红色半透明标出。" : ed.op ? "在 3D 里点一台仪器，或在右侧清单里选；第一次操作时换成资产库里带关节的模型（和资产库同一个文件），门、盖、抽屉、旋钮就能动。" : "") + "</p>";
  }
  function invRow(v, id) { return (v.inventory || []).filter(function (x) { return x[4] === id; })[0]; }
  function rmNote(v) {   // what the current version (or the edit in progress) removes
    var ids = Object.keys(ed.removed); if (!ids.length) return '<span class="muted">这个版本没有删掉物件。</span>';
    var cnt = {}; ids.forEach(function (id) { var r = invRow(v, id), k = r ? (r[0] || r[1] || id) : id; cnt[k] = (cnt[k] || 0) + 1; });
    var parts = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (k) { return esc(k) + (cnt[k] > 1 ? " ×" + cnt[k] : ""); });
    return '<span class="r2d-rmdot" aria-hidden="true"></span><b>这个版本删掉 ' + ids.length + " 件</b>" + (ed.ghost ? "（3D 里红色半透明、红框标出）" : "（3D 里已隐藏）") + "：" + parts.slice(0, 24).join("、") + (parts.length > 24 ? " 等" : "");
  }
  function opOf(v, id) { return (v.ops || []).filter(function (x) { return x.id === id; })[0]; }
  function jtText(o) { return o && o.jt && o.jt[1] ? "关节短测 " + o.jt[0] + "/" + o.jt[1] + (o.jt[2] ? " 通过" : "") : ""; }
  function opPanel(v) {
    var list = (v.ops || []).filter(function (o) { return !ed.removed[o.id]; });
    var gone = (v.ops || []).length - list.length;
    return '<div class="r2d-sel" id="r2d-opcard">' + (ed.opSel ? opCard(v, ed.opSel) : '<span class="muted small">在 3D 里点一台仪器，或在下面选一台</span>') + "</div>" +
      '<div class="r2d-list small"><b>这个版本里能操作的仪器（' + list.length + " 台）</b>" + (gone ? '<span class="muted">；另有 ' + gone + " 台在这个版本里被删掉了</span>" : "") +
      list.map(function (o) { var r = invRow(v, o.id) || []; return '<button type="button" class="r2d-oprow' + (o.id === ed.opSel ? " on" : "") + '" data-opsel="' + esc(o.id) + '"><b>' + esc(r[0] || o.id) + "</b> " + esc(r[1] || "") + ' <span class="muted">' + esc(jtText(o)) + "</span></button>"; }).join("") + "</div>";
  }
  function opCard(v, id) {
    var o = opOf(v, id), r = invRow(v, id) || [];
    if (!o) return '<span class="small">' + esc(r[0] || id) + " 不是可操作的仪器" + (r[2] ? "（资产 " + esc(r[2]) + " 在资产库里没有关节文件）" : "") + "</span>";
    var ar = ed.art[o.k], head = '<div class="small"><b>' + esc(r[0] || id) + "</b> " + esc(r[1] || "") + '<div class="muted">' + (o.art ? "自建资产（代理导出的关节文件）：" : "资产库：") + esc(r[2] || o.k) + (jtText(o) ? " · Isaac Sim " + esc(jtText(o)) : "") + "</div></div>";
    if (!ar) return head + '<p class="small muted">正在读关节…</p>';
    var fi = ar.joints.map(function (j, i) { return i; }).filter(function (i) { return jfunc(ar.joints[i]); });
    if (!fi.length) return head + '<p class="small muted">这台仪器在资产库里没有能活动的部件。</p>';
    var byG = {}; fi.forEach(function (i) { var g = jgroup(ar.joints[i].name); (byG[g] = byG[g] || []).push(i); });
    var acc = byG[0] || [];
    return head + '<div class="r2d-opbtns"><button type="button" class="jchip" data-opall="1">' + (acc.length ? "打开全部门和盖（" + acc.length + "）" : "所有部件动起来（" + fi.length + "）") + '</button><button type="button" class="jchip" data-opall="0">全部关上</button></div>' +
      Object.keys(byG).sort().map(function (g) {
        return '<div class="small r2d-opg"><span class="muted">' + esc(g < JGROUPS.length ? JGROUPS[g][1] : "其它可动部件") + "</span><div>" + byG[g].map(function (i) { var j = ar.joints[i], t = jfull(j);
          return '<button type="button" class="jchip" data-oj="' + i + '" aria-pressed="false" title="' + esc(jname(j.name) + "：" + (j.type === "revolute" ? "转动 0 → " + Math.round(t) + "°" : "滑动 0 → " + Math.round(t * 1000) + " mm")) + '">' + esc(zhPart(j.name)) + "</button>"; }).join("") + "</div></div>";
      }).join("") + '<p class="small muted" id="r2d-opmsg">' + esc(ed.opMsg) + "</p>";
  }
  function pickOp(id, focus) {
    var v = ver(), o = opOf(v, id); ed.opSel = id; ed.opMsg = "";
    var side = document.getElementById("r2d-side"); if (side && ed.op) side.innerHTML = opPanel(v);
    if (!o || !ed.viewer) return;
    if (ed.viewer.select) ed.viewer.select(id);
    if (!ed.art[o.k]) fetch(o.art || "assets/artic/" + o.k + ".json").then(function (r) { return r.json(); }).then(function (a) { ed.art[o.k] = a; if (ed.opSel === id) { var c = document.getElementById("r2d-opcard"); if (c) c.innerHTML = opCard(ver(), id); } });
    ed.opMsg = "正在换成资产库里带关节的模型…"; var m0 = document.getElementById("r2d-opmsg"); if (m0) m0.textContent = ed.opMsg;
    ed.viewer.ensureOp(id).then(function () { ed.opMsg = "已换成资产库里带关节的模型，可以操作。"; var m = document.getElementById("r2d-opmsg"); if (m) m.textContent = ed.opMsg; if (focus) ed.viewer.focus(id); },
      function (e) { ed.opMsg = "可动模型加载失败：" + ((e && e.message) || e); var m = document.getElementById("r2d-opmsg"); if (m) m.textContent = ed.opMsg; });
    if (focus) ed.viewer.focus(id);
  }
  function editPanel(v) {
    var groups = {};
    (v.inventory || []).forEach(function (r) { if (!r[4]) return; var t = r[5] || "other"; (groups[t] = groups[t] || []).push(r); });
    var order = ["support", "large", "instrument", "furniture", "tool", "small", "robot", "other"];
    return '<div class="r2d-sel" id="r2d-sel">' + (ed.sel ? selCard(v, ed.sel) : '<span class="muted small">在 3D 里点一件物体选中</span>') + "</div>" +
      '<div class="r2d-quick small">快速：<button type="button" class="jchip" data-quick="furniture">去掉家具（椅子等）</button><button type="button" class="jchip" data-quick="tool">去掉工具和耗材</button><button type="button" class="jchip" data-quick="none">全部恢复</button></div>' +
      '<div class="r2d-list">' + order.filter(function (k) { return groups[k]; }).map(function (k) {
        return "<details" + (k === "furniture" || k === "instrument" ? " open" : "") + "><summary class=\"small\"><b>" + esc(TIERNAME[k] || k) + "</b>（" + groups[k].length + "）</summary>" + groups[k].map(function (r) {
          return '<label class="r2d-row small"><input type="checkbox" data-rm="' + esc(r[4]) + '"' + (ed.removed[r[4]] ? " checked" : "") + "> " + esc(r[0]) + ' <span class="muted">' + esc(r[1]) + "</span></label>"; }).join("") + "</details>";
      }).join("") + "</div>" +
      '<button type="button" class="btn r2d-make" data-make>生成新版本请求（去掉 ' + Object.keys(ed.removed).length + " 件）</button>" +
      '<div id="r2d-req"></div>';
  }
  function selCard(v, id) {
    var r = (v.inventory || []).filter(function (x) { return x[4] === id; })[0];
    if (!r) return '<span class="small">' + esc(id) + "</span>";
    return '<div class="small"><b>' + esc(r[0]) + "</b> " + esc(r[1]) + '<div class="muted">资产：' + esc(r[2]) + " · " + esc({ exact: "同型号", similar: "相似", placeholder: "占位" }[r[3]] || r[3]) + " · " + esc(TIERNAME[r[5]] || r[5]) + "</div>" +
      '<button type="button" class="jchip" data-toggle="' + esc(id) + '">' + (ed.removed[id] ? "放回去" : "去掉") + "</button>" +
      (opOf(v, id) && !ed.removed[id] ? ' <button type="button" class="jchip" data-gotoop="' + esc(id) + '">操作这台仪器</button>' : "") + "</div>";
  }
  function applyHidden() { if (ed.viewer && ed.viewer.setHidden) { var h = new Set(Object.keys(ed.removed)); ed.viewer.setHidden(h, ed.ghost); } var rn = document.getElementById("r2d-rm"); if (rn) rn.innerHTML = rmNote(ver()); }
  function open3d() {
    var v = ver(), vs = variantsOf(v), stg = document.getElementById("r2d-stage"); if (!stg || !vs.length) return;
    var cur = ed.variant === "preview" ? vs[0] : vs[Math.min(ed.variant, vs.length - 1)];
    var ob = document.getElementById("r2d-open"); if (ob) ob.hidden = true;
    var go = function (m) {
      if (ed.viewer) { ed.viewer.dispose(); ed.viewer = null; }
      ed.viewer = m.mount(stg, { views: document.getElementById("r2d-views"), msg: document.getElementById("r2d-msg"), hud: document.getElementById("r2d-hud"),
        onPick: function (id) {
          if (ed.op) { if (id && opOf(ver(), id)) pickOp(id, false); else { var oc = document.getElementById("r2d-opcard"); if (oc) oc.innerHTML = id ? opCard(ver(), id) : '<span class="muted small">点到的不是仪器</span>'; } return; }
          ed.sel = id; var c = document.getElementById("r2d-sel"); if (c) c.innerHTML = id ? selCard(ver(), id) : '<span class="muted small">点到的不是可删改的物体</span>'; } });
      ed.viewer.open({ label: cur.label, lit: true, cut: 2.3, w3d: { p: cur.glb, fmt: "glb", mb: "" }, items: (v.inventory || []).map(function (r) { return r[4]; }).filter(Boolean), ops: v.ops || [] }).then(function () {
        applyHidden();
        if (ed.op && ed.opSel) pickOp(ed.opSel, true);
        var n = ed.viewer.pickable ? ed.viewer.pickable() : 0, note = document.getElementById("r2d-note");
        if (note && !n) note.innerHTML = '<span class="warn">这个 3D 文件还是整体合并的一个网格，暂时不能逐件选中、隐藏；正在把各间按物件逐件重导出（每件一个节点），交来后这里就能点选和删改。</span>';
      });
    };
    if (ed.mod) go(ed.mod);
    else import(new URL("assets/r2s_viewer.js" + (window.OL_BUILD ? "?v=" + window.OL_BUILD : ""), document.baseURI).href).then(function (m) { ed.mod = m; go(m); });
  }
  function makeRequest() {
    var v = ver(), vs = variantsOf(v), cur = vs[typeof ed.variant === "number" ? Math.min(ed.variant, vs.length - 1) : 0] || { id: "full" };
    var rm = Object.keys(ed.removed);
    var req = { lab: lab().id, from: cur.id, remove: rm, name: "custom-" + new Date().toISOString().slice(0, 16).replace(/[-:T]/g, ""), requested_utc: new Date().toISOString().slice(0, 19) + "Z" };
    var txt = JSON.stringify(req, null, 1), box = document.getElementById("r2d-req"); if (!box) return;
    var blob = URL.createObjectURL(new Blob([txt], { type: "application/json" }));
    box.innerHTML = '<p class="small">把下面这段发给 HQ（或下载文件发过来），A 会据此生成新版本：在完整版上把这 ' + rm.length + " 件设为不激活，重导 3D，跑物理检查，完成后出现在上面的版本按钮里。</p>" +
      '<textarea class="r2d-txt" readonly rows="6">' + esc(txt) + '</textarea><div class="small"><button type="button" class="jchip" data-copy>复制</button> <a class="jchip" download="' + esc(req.name) + '.json" href="' + blob + '">下载 JSON</a></div>';
  }
  el.addEventListener("click", function (e) {
    var t = e.target.closest("#r2d-open,[data-var],[data-edit],[data-toggle],[data-quick],[data-make],[data-copy],[data-cut],[data-ghost],[data-op],[data-opsel],[data-opall],[data-oj],[data-gotoop]"); if (!t) return;
    if (t.hasAttribute("data-ghost")) { ed.ghost = !ed.ghost; t.setAttribute("aria-pressed", String(ed.ghost)); t.textContent = "被删物件：" + (ed.ghost ? "红色标出" : "隐藏"); applyHidden(); return; }
    if (t.hasAttribute("data-op") || t.hasAttribute("data-gotoop")) {
      if (t.hasAttribute("data-gotoop")) { ed.op = true; ed.on = false; ed.opSel = t.getAttribute("data-gotoop"); } else { ed.op = !ed.op; if (ed.op) ed.on = false; }
      var keep0 = ed.viewer; ed.viewer = null; render(); if (keep0) { keep0.dispose(); open3d(); } return; }
    if (t.hasAttribute("data-opsel")) { pickOp(t.getAttribute("data-opsel"), true); return; }
    if (t.hasAttribute("data-opall") || t.hasAttribute("data-oj")) {
      var o = opOf(ver(), ed.opSel), ar = o && ed.art[o.k]; if (!o || !ar || !ed.viewer) return;
      var fi = ar.joints.map(function (j, i) { return i; }).filter(function (i) { return jfunc(ar.joints[i]); }), acc = fi.filter(function (i) { return jgroup(ar.joints[i].name) === 0; });
      var idx, on;
      if (t.hasAttribute("data-opall")) { on = t.getAttribute("data-opall") === "1"; idx = on ? (acc.length ? acc : fi) : fi; el.querySelectorAll("[data-oj]").forEach(function (b) { if (idx.indexOf(+b.getAttribute("data-oj")) >= 0) b.setAttribute("aria-pressed", String(on)); }); }
      else { var i = +t.getAttribute("data-oj"); on = t.getAttribute("aria-pressed") !== "true"; idx = [i]; t.setAttribute("aria-pressed", String(on)); }
      var msg = document.getElementById("r2d-opmsg"); if (msg) msg.textContent = (on ? "正在打开 " : "正在关上 ") + idx.map(function (i) { return zhPart(ar.joints[i].name); }).slice(0, 6).join("、") + (idx.length > 6 ? " 等 " + idx.length + " 个部件" : "");
      idx.forEach(function (i) { ed.viewer.operate(ed.opSel, i, on); });
      return;
    }
    if (t.hasAttribute("data-cut")) { var on = t.getAttribute("aria-pressed") !== "true"; t.setAttribute("aria-pressed", String(on)); t.textContent = on ? "顶棚切开" : "顶棚显示"; if (ed.viewer) ed.viewer.setCut(on); return; }
    var v = ver();
    if (t.id === "r2d-open") { open3d(); return; }
    if (t.hasAttribute("data-var")) { var x = t.getAttribute("data-var"); ed.variant = x === "preview" ? "preview" : +x; ed.removed = x === "preview" ? basePreview(v) : hideOf(variantsOf(v)[+x]); render(); open3d(); return; }
    if (t.hasAttribute("data-edit")) { ed.on = !ed.on; if (ed.on) ed.op = false; var keep = ed.viewer; ed.viewer = null; render(); if (keep) { keep.dispose(); open3d(); } return; }
    if (t.hasAttribute("data-toggle")) { var id = t.getAttribute("data-toggle"); if (ed.removed[id]) delete ed.removed[id]; else ed.removed[id] = 1; refreshEdit(); return; }
    if (t.hasAttribute("data-quick")) {
      var q = t.getAttribute("data-quick");
      if (q === "none") ed.removed = {}; else (v.inventory || []).forEach(function (r) { if (r[4] && r[5] === q) ed.removed[r[4]] = 1; });
      refreshEdit(); return;
    }
    if (t.hasAttribute("data-make")) { makeRequest(); return; }
    if (t.hasAttribute("data-copy")) { var ta = el.querySelector(".r2d-txt"); if (ta) { ta.select(); try { navigator.clipboard.writeText(ta.value); } catch (x) { document.execCommand("copy"); } t.textContent = "已复制"; } }
  });
  el.addEventListener("mouseover", function (e) { var b = e.target.closest && e.target.closest("[data-oj]"); if (b && ed.viewer && ed.opSel) ed.viewer.highlightJoint(ed.opSel, +b.getAttribute("data-oj")); });
  el.addEventListener("mouseout", function (e) { var b = e.target.closest && e.target.closest("[data-oj]"); if (b && ed.viewer && ed.opSel) ed.viewer.highlightJoint(ed.opSel, null); });
  el.addEventListener("change", function (e) {
    var id = e.target.getAttribute && e.target.getAttribute("data-rm"); if (!id) return;
    if (e.target.checked) ed.removed[id] = 1; else delete ed.removed[id];
    refreshEdit();
  });
  function refreshEdit() {
    applyHidden();
    var side = document.getElementById("r2d-side"); if (side) { var open = {}; side.querySelectorAll("details").forEach(function (d, i) { open[i] = d.open; }); side.innerHTML = editPanel(ver()); side.querySelectorAll("details").forEach(function (d, i) { if (open[i] != null) d.open = open[i]; }); }
    var b = el.querySelector("[data-edit]"), n = Object.keys(ed.removed).length; if (b) b.textContent = "删改物件" + (n ? "（已去掉 " + n + " 件）" : "");
  }
  function extras() {
    var v = ver(); if (!v || v.kind !== "v3") return "";
    var out = "";
    if (v.measure) out += '<p class="small"><b>测量</b>：房间 ' + esc((v.measure.room_m || []).join(" × ")) + " m" + (v.measure.basis ? '<span class="muted">（' + esc(v.measure.basis) + "）</span>" : "") + "</p>";
    if (v.timing) out += '<p class="small"><b>这间的重建用时</b>：' + v.timing.stages.map(function (st) { var n = STAGE[st[0]]; return esc(n ? n[0] : st[0]) + " " + (st[1] < 60 ? Math.round(st[1]) + " 秒" : (st[1] / 60).toFixed(1) + " 分"); }).join(" → ") +
      "；合计 <b>" + (v.timing.wall_min != null ? v.timing.wall_min.toFixed(1) : "–") + " 分钟</b>" + (v.timing.gpu_h != null ? "，GPU " + v.timing.gpu_h.toFixed(2) + " 卡时" : "") + "</p>";
    if (v.inventory && v.inventory.length) out += '<details><summary class="small"><b>代理认出的设施和仪器</b>（' + v.inventory.length + '）</summary><table class="cmp r2p-inv"><thead><tr><th>类别</th><th>原片里的东西</th><th>换成的资产</th><th>匹配</th></tr></thead><tbody>' +
      v.inventory.map(function (r) { return "<tr><td>" + esc(r[0]) + "</td><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td><td>" + esc({ exact: "同型号", similar: "相似", placeholder: "占位" }[r[3]] || r[3]) + "</td></tr>"; }).join("") + "</tbody></table></details>";
    if (v.corrections && v.corrections.length) out += '<details><summary class="small"><b>对比后的修正</b>（' + v.corrections.length + "）</summary><ul class=\"small\">" + v.corrections.map(function (c) { return "<li><b>" + esc(c[0]) + "</b> — " + esc(c[1]) + "</li>"; }).join("") + "</ul></details>";
    return out;
  }
  function render() {
    var l = lab();
    var key = st.lab + "|" + st.ver;
    if (ed.key !== key) { if (ed.viewer) { ed.viewer.dispose(); ed.viewer = null; } ed.key = key; ed.removed = {}; ed.sel = null; ed.variant = 0; }
    else if (ed.viewer) { ed.viewer.dispose(); ed.viewer = null; }
    el.innerHTML = header() + roadmap() + flow() + labChips() + '<div class="r2p-body"><p class="small"><b>' + esc(l.title) + "</b>" + (l.src_note ? ' <span class="muted">· ' + esc(l.src_note) + "</span>" : "") + "</p>" + controls() + stage() + strip() + videos() + threeD() + extras() + "</div>";
    bindVideos();
  }
  function bindVideos() {
    el.querySelectorAll(".r2p-vpair").forEach(function (box) {
      var i = box.getAttribute("data-vp"), vs = box.querySelectorAll("video"), a = vs[0], b = vs[1];
      var btn = el.querySelector('[data-vplay="' + i + '"]'), seek = el.querySelector('[data-vseek="' + i + '"]'), tm = el.querySelector('[data-vtime="' + i + '"]');
      function sync() { if (Math.abs(b.currentTime - a.currentTime) > 0.12) b.currentTime = a.currentTime; }
      a.addEventListener("timeupdate", function () { sync(); if (a.duration) { seek.value = Math.round(1000 * a.currentTime / a.duration); tm.textContent = a.currentTime.toFixed(1) + " / " + a.duration.toFixed(1) + " s"; } });
      a.addEventListener("ended", function () { b.pause(); btn.textContent = "▶ 同步播放"; });
      btn.addEventListener("click", function () { if (a.paused) { b.currentTime = a.currentTime; a.play(); b.play(); btn.textContent = "❚❚ 暂停"; } else { a.pause(); b.pause(); btn.textContent = "▶ 同步播放"; } });
      seek.addEventListener("input", function () { if (a.duration) { a.currentTime = b.currentTime = a.duration * seek.value / 1000; } });
    });
  }
  el.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lab],[data-view],[data-mode]"); if (!t) return;
    if (t.hasAttribute("data-lab")) { st.lab = +t.getAttribute("data-lab"); pickVersion(); var w = viewsWithRender(); st.view = w.length ? w[0] : 0; }
    else if (t.hasAttribute("data-view")) st.view = +t.getAttribute("data-view");
    else st.mode = t.getAttribute("data-mode");
    render();
  });
  el.addEventListener("change", function (e) { if (e.target.id === "r2p-ver") { st.ver = +e.target.value; var w = viewsWithRender(); if (w.length && w.indexOf(st.view) < 0) st.view = w[0]; render(); } });
  el.addEventListener("input", function (e) {
    if (e.target.id !== "r2p-range") return;
    st.swipe = +e.target.value; var top = el.querySelector(".r2p-top"), bar = el.querySelector(".r2p-bar");
    if (top) top.style.clipPath = "inset(0 0 0 " + st.swipe + "%)"; if (bar) bar.style.left = st.swipe + "%";
  });
  document.addEventListener("keydown", function (e) {
    if (!el.contains(document.activeElement) && document.activeElement !== document.body) return;
    var n = lab().views.length; if (!n) return;
    if (e.key === "ArrowRight") { st.view = (st.view + 1) % n; render(); }
    if (e.key === "ArrowLeft") { st.view = (st.view - 1 + n) % n; render(); }
  });
  pickVersion(); var w0 = viewsWithRender(); st.view = w0.length ? w0[0] : 0;
  render();
})();
