/* Real2sim: compare the routes scene by scene. Owner requests 11-24: see each scene's sources, the same-view picture
   comparison (Isaac Sim and online), the 3D model (online) and videos; explain R1–R5 clearly; show why a route did not run.
   Built from data/r2s_trials.js; 3D and the online same-view renders via assets/r2s_viewer.js. */
(function () {
  var T = window.R2S_TRIALS, el = document.getElementById("r2scompare");
  if (!el || !T) return;
  var esc = window.OL ? window.OL.esc : function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var KIND = { paper_image: "论文插图", photo: "网络照片", video: "实验室视频", test: "渲染的测试视频" };
  var RCOL = { R1: "--s1", R2: "--accent", R3: "--s2", R4: "--s3", R5: "--warn" };
  var TIERS = ["fast", "medium", "full", "manhattan", "generative"];

  // What each route is, in plain words, and what these runs actually used (HQ summary of the real2sim agent's reports;
  // the agent's own ROUTES.json replaces it when present in the data).
  var INFO = {
    R1: { name: "逐张图估深度", plain: "AI 逐张看图，估出每个点离相机多远，把这些估计变成 3D 点，再拟合出一个简单的房间。",
      needs: "什么都行：一张图、几张图或一段视频", ex: "cwu_science_chem_lab|R1|full", exCap: "CWU 实验室视频，full 档",
      verdict: "旧方法里最好，但房间普遍短了约三分之一",
      tech: ["逐张深度：Depth-Anything-V2 室内度量深度模型", "表面标注（地面、墙、台面、杂物）：SegFormer、Grounding-DINO", "房间和实验台按互相垂直的盒子拟合"] },
    R2: { name: "先求出每张照片的拍摄位置", plain: "像 3D 扫描 App：在互相重叠的照片里匹配同一个点，算出每张照片拍摄时相机的准确位置，再把所有照片合成一个房间。",
      needs: "多张互相重叠的照片，或一段视频（论文插图不行）", ex: "lipomics_analytical_lab|R2|medium", exCap: "Lipomics，17 张重叠照片，medium 档",
      verdict: "重叠照片多时最好；在视频上旧方法会跟丢，把房间建得过大",
      tech: ["相机位置：pycolmap / COLMAP 运动恢复结构（SfM）加光束法平差（BA）", "之后和 R1 一样估深度、拟合盒子，但都在同一个坐标系里"] },
    R3: { name: "只出平面图（占位）", plain: "本来要用专门的布局 AI 直接预测平面图。这个 AI 还没接进来，所以现在只是 R1 的简化版。",
      needs: "什么都行", ex: "cwu_science_chem_lab|R3|medium", exCap: "CWU 实验室视频",
      verdict: "目前先不看",
      tech: ["临时替代：对 R1 的 3D 点拟合一个俯视矩形", "计划：换成 RoomFormer 或 Plane-DUSt3R 这类布局模型"] },
    R4: { name: "只要照片级外观", plain: "学出几百万个半透明的彩色小点，从附近看和视频一模一样。但它没有真正的地面、墙和台面，机器人用不了。",
      needs: "一段视频或大量重叠照片", ex: "austin_bioscience_incubator|R4|medium", exCap: "Austin 实验室视频",
      verdict: "只用来参考外观能做到多真实；目前还模糊",
      tech: ["3D 高斯泼溅（gsplat），在视频帧上训练 30,000 步"] },
    R5: { name: "一张图，补出其余部分", plain: "只有一张图（比如论文插图）时：先估这张图的深度，再补出相机没拍到的墙。两种补法：把看到的墙延长成一个盒子（manhattan），或者让图像 AI 画出来（generative）。",
      needs: "一张图", ex: "alab_lbnl|R5|manhattan", exCap: "A-Lab 论文插图，盒子版",
      verdict: "用盒子版；AI 画墙版慢 4.5 倍，房间还偏大",
      tech: ["单图深度：MoGe-2、Depth Anything", "没拍到的墙：盒子延长，或 SD-Turbo 生成"] }
  };
  // Chinese for the agent's "not run here" reasons (English from the data is shown if a new reason appears).
  var ZH_INAP = {"Paper figure panels are sparse, non-overlapping crops from distinct robot stations; feature matching and multi-view SfM/BA cannot form a single connected pose graph.": "论文插图是来自不同机器人工位的零散局部图，互不重叠；特征匹配和多视角 SfM/BA 连不成一张完整的位姿图。", "3DGS/3DGUT novel-view synthesis requires dense overlapping multi-view observations with registered poses, unavailable from sparse paper figures.": "3DGS/3DGUT 新视角合成需要密集重叠、位姿已配准的多视角观测，稀疏的论文插图给不了。", "Paper figures consist of 1 wide panorama plus disjoint station close-ups with insufficient baseline overlap for multi-view SfM/BA.": "论文插图只有 1 张宽幅全景加几张互不相连的工位特写，视角重叠不够，做不了多视角 SfM/BA。", "Insufficient dense multi-view coverage across the room for 3DGS/3DGUT radiance field optimization.": "房间里缺少密集的多视角覆盖，没法优化 3DGS/3DGUT 辐射场。", "Allocated to 4 representative labs spanning all modalities (alab_lbnl, lipomics_analytical_lab, cwu_science_chem_lab, austin_bioscience_incubator); Stanford multi-bay tour spans multiple separate sub-rooms (bay, TC room, corridor).": "R3 只分配给覆盖全部输入类型的 4 间代表性实验室（alab_lbnl、lipomics_analytical_lab、cwu_science_chem_lab、austin_bioscience_incubator）；Stanford 的参观照片跨了好几个独立的子房间（实验隔间、TC 室、走廊）。", "8 sparse tour photos span multiple distinct rooms/bays without dense overlapping camera trajectories required for 3DGS/3DGUT.": "8 张稀疏的参观照片跨了好几个不同的房间和隔间，没有 3DGS/3DGUT 需要的密集重叠相机轨迹。", "R5 evaluates single-frame unseen-wall completion targeted at sparse paper/single-shot inputs; Lipomics provides 17 overlapping 360-degree views where full walls are directly observed.": "R5 测的是单帧补全没拍到的墙，针对稀疏的论文图或单张照片；Lipomics 有 17 张互相重叠的 360° 视图，墙都直接拍到了。", "R5 targets single-image completion; CWU provides continuous multi-angle 1080p walkthrough video where surrounding walls and benches are directly observed.": "R5 针对单图补全；CWU 有连续、多角度的 1080p 漫游视频，四周的墙和台都直接拍到了。", "R5 targets single-image completion; Austin Bioscience Incubator provides continuous 1080p multi-view video sweeps across the lab.": "R5 针对单图补全；Austin Bioscience Incubator 有扫过整个实验室的连续 1080p 多视角视频。"};
  var ROUTES = (T.routes || []).map(function (r) { return r.id; }).filter(function (id) { return INFO[id]; });

  function dur(s) { if (s == null || isNaN(s)) return "—"; s = Math.round(s); var m = Math.floor(s / 60), r = s % 60; return m ? m + " 分 " + (r < 10 ? "0" : "") + r + " 秒" : r + " 秒"; }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : null; }
  function short(t) { return String(t || "").split(/[—:(]/)[0].trim(); }
  function build(tm) { return tm && tm.wall != null ? tm.wall - (tm.st.isaac_eval || 0) : null; }
  function byRoute(a, b) { return a.route < b.route ? -1 : a.route > b.route ? 1 : TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier); }
  function chip(txt, c, tip) { return '<span class="opst" style="--c:' + c + '"' + (tip ? ' title="' + esc(tip) + '"' : "") + ">" + esc(txt) + "</span>"; }
  function img(ims, kind, cam) { var x = (ims || []).filter(function (i) { return i[2] === kind && (cam == null || i[3] === cam); })[0]; return x ? x[0] : null; }
  function dot(route) { return '<span class="r2sdot" style="background:var(' + (RCOL[route] || "--muted") + ')"></span>'; }

  // ---- scenes: the six real labs, then the rendered test room whose true layout is known
  var inap = {}; (T.inap || []).forEach(function (x) { (inap[x[0]] = inap[x[0]] || []).push([x[1], x[2]]); });
  var scenes = T.labs.map(function (l) {
    var runs = Object.keys(T.results).filter(function (k) { return k.split("|")[0] === l.id; }).map(function (k) {
      var p = k.split("|"), R = T.results[k];
      return { key: k, route: p[1], tier: p[2], w3d: R.w3d, ims: R.ims, vid: R.vid, tm: R.tm, m: R.m || {}, verdict: R.verdict, clean: R.clean };
    }).sort(byRoute);
    var gal = (l.gal && l.gal.length) ? l.gal : (l.thumb ? [[l.thumb, "", "src_cam_0", l.cite, l.lic]] : []);
    return { id: l.id, name: short(l.title), title: l.title, kind: l.type, inst: l.inst, cite: l.cite, url: l.url, lic: l.lic, licOk: l.lic_st === "permissive", gal: gal, cmp: l.cmp, runs: runs, skip: inap[l.id] || [] };
  });
  if (T.m0 && T.m0.length) {
    var cov = T.m0_cov || {};
    scenes.push({ id: "m0", name: "测试房间（已知真值）", title: "已批准房间 legacy_l0，由 step 1 渲染", kind: "test", test: true, cov: cov, cmp: cov.cmp,
      truth: T.m0[0].gt, benches: T.m0[0].benches[1], gal: T.m0_gal || [], skip: [["R4", "测试房间上没跑"], ["R5", "单图路线；测试输入是视频"]],
      runs: T.m0.map(function (r) { return { key: "m0|" + r.route + "|" + r.tier, route: r.route, tier: r.tier, w3d: r.w3d, ims: r.ims, vid: r.vid, tm: r.tm, m0: r, clean: r.clean }; }).sort(byRoute) });
  }

  function facts(sc, r) {
    var cl = r.clean, clRow = cl ? ["Blender 清理", cl.st === "success" ? chip("通过", "#1f9d55") + (cl.de != null ? " 色差 ΔE " + cl.de.toFixed(1) + "（上限 10）" : "") + (cl.det && cl.det.doors != null ? ' <span class="muted">· ' + cl.det.doors + " 扇门、" + (cl.det.drawers || 0) + " 个抽屉、" + (cl.det.handles || 0) + " 个把手</span>" : "") : chip("未通过", "#f08c00") + ' <span class="muted">' + esc(cleanWhy(r).replace(/^清理版未通过：/, "")) + "</span>"] : null;
    var rows0 = facts0(sc, r); if (clRow) rows0.push(clRow); return rows0;
  }
  function facts0(sc, r) {
    var rows = [["构建时间", dur(build(r.tm)) + (r.tm && r.tm.wall != null ? ' <span class="muted">（含 Isaac Sim 检查共 ' + dur(r.tm.wall) + "）</span>" : "")]];
    if (sc.test) {
      var q = r.m0, pct = function (v) { return v == null ? "—" : Math.abs(v).toFixed(0) + "%"; };
      rows.push(["重建出的房间", q.pred[0] != null ? q.pred.map(function (x) { return x.toFixed(1); }).join(" × ") + ' m <span class="muted">（真值 ' + q.gt.map(function (x) { return x.toFixed(1); }).join(" × ") + "）</span>" : "—"]);
      rows.push(["尺寸误差", pct(q.err[0]) + " / " + pct(q.err[1]) + " / " + pct(q.err[2]) + ' <span class="muted">长边 / 短边 / 高</span>']);
      if (q.vis) rows.push(["相对视频可见范围的误差", pct(q.vis.err[3]) + ' <span class="muted">三边平均</span>']);
      rows.push(["找到的实验台", q.vis && q.vis.bench[1] ? "可见的 " + q.vis.bench[1] + " 张里找到 " + q.vis.bench[0] + ' 张 <span class="muted">（高度误差 ' + (q.bench_h_cm != null ? q.bench_h_cm.toFixed(1) + " cm" : "—") + "，位置误差 " + (q.bench_pos_m != null ? q.bench_pos_m.toFixed(2) + " m" : "—") + "）</span>" : "—"]);
      rows.push(["相机轨迹误差", q.ate != null ? q.ate.toFixed(2) + " m" : chip("失败", "#d6336c", q.ate_fail)]);
      return rows;
    }
    var m = r.m, L = num(m["geometry.length_m"]), W = num(m["geometry.width_m"]), H = num(m["geometry.height_m"]);
    if (r.route === "R4") {
      var ex = m["texture.evaluation_validity"] === "registration_failed_excluded", hp = num(m["texture.heldout_psnr_db"]), tp = num(m["texture.train_psnr_db"]);
      rows.push(["是什么", "照片级高斯点：只有外观，没有可以放东西的地面和台面"]);
      rows.push(["画面质量", ex ? chip("配准失败，不计入", "#d6336c") : hp != null ? hp.toFixed(1) + ' dB <span class="muted">未参与训练的视角</span>' : tp != null ? tp.toFixed(1) + ' dB <span class="muted">训练视角（短训练）</span>' : "—"]);
      return rows;
    }
    var st = m["scale.scale_status"], se = num(m["scale.error_pct"]);
    rows.push(["房间", L != null ? [L, W, H].map(function (x) { return x.toFixed(1); }).join(" × ") + " m" : "—"]);
    rows.push(["尺度", st === "anchored" ? chip("已锚定", "#1f9d55") + " " + (se != null ? "参考物之间相差 " + se.toFixed(1) + "%" : "") : st === "inconsistent" ? chip("参考物不一致" + (se != null ? "（" + se.toFixed(0) + "%）" : ""), "#d6336c") : chip("未锚定", "#f08c00")]);
    var fit = num(m["geometry.shell_residuals.overall.p50_cm"]); if (fit != null) rows.push(["与源点云的贴合", fit.toFixed(0) + ' cm <span class="muted">中位距离</span>']);
    var ph = num(m["texture.observed_ratio"]); if (ph != null) rows.push(["来自图片的纹理", Math.round(ph * 100) + "%"]);
    var bk = m["usability.beaker_100ml_2s_test.all_passed_le_2mm"]; rows.push(["烧杯测试", bk === true || bk === "True" ? chip("通过", "#1f9d55") : bk === false || bk === "False" ? chip("不通过", "#d6336c") : "—"]);
    return rows;
  }

  // ---- page skeleton: the five routes, the verdict, the scenes
  function exImg(k) { var R = T.results[k]; return R ? img(R.ims, "render_same_view") : null; }
  function exTime(k) { var R = T.results[k]; return R ? build(R.tm) : null; }
  function med(a) { a = a.filter(function (x) { return x != null && isFinite(x); }).sort(function (x, y) { return x - y; }); if (!a.length) return null; var h = Math.floor(a.length / 2); return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; }
  function runsOf(id) { return Object.keys(T.results).filter(function (k) { return k.split("|")[1] === id; }).map(function (k) { return T.results[k]; }).filter(function (R) { return R.tm; }); }
  function stageMed(rs, st) { return med(rs.map(function (R) { return R.tm.st[st]; })); }
  function sec(x) { return x == null ? "" : '<em class="r2c-t">≈ ' + (x < 10 ? x.toFixed(1) + " 秒" : dur(x)) + "</em>"; }
  // Our technical route: the design agreed with the owner on 11-23 (4 input routes x 3 speed tiers -> RoomIR -> OpenUSD),
  // with an honest status per stage and tier, target vs measured speed, the roadmap phases and the 6 acceptance checks.
  function design() {
    var ST = { done: ["#1f9d55", "已完成"], part: ["#f08c00", "部分完成"], tried: ["#2f6fdb", "已试过"], todo: ["#8a8f98", "未开始"], alt: ["#6c5ce7", "已替换"] };
    var st = function (k, note) { var c = ST[k]; return '<span class="opst" style="--c:' + c[0] + '"' + (note ? ' title="' + esc(note) + '"' : "") + ">" + c[1] + "</span>" + (note ? '<small class="r2c-note">' + esc(note) + "</small>" : ""); };
    var inputs = [
      ["1 · 普通图片", "任意相机或网络照片，1–N 张", "tried", "Stanford（8 张）、Lipomics（17 张）"],
      ["2 · iPhone 17 Pro Max", "照片或视频，可选 LiDAR / RoomPlan 给出准确尺度", "todo", "需要你实地拍一间实验室"],
      ["3 · 实验室漫游视频", "网上的实验室参观视频，或任意手机视频", "tried", "CWU、Austin 和测试房间；你 11-25 选的 6 间视频实验室正在收集（优先）"],
      ["4 · 论文插图", "论文里的 1–N 张插图", "tried", "A-Lab、Liverpool；已降低优先级：插图裁得太多、太杂乱"]];
    var stages = [
      ["1 · 相机位置和真实尺寸的 3D", [["Depth Anything 3 / MapAnything 一次前向", "≈15 秒", "part", "本页的运行用的是 Depth-Anything-V2（R1）；新方法已换成 DA3"], ["+ 轻量光束法平差", "≈45 秒", "tried", "R2 fast / medium"], ["完整 COLMAP / GLOMAP；论文插图的盲区用 SpatialGen 补", "≈4 分钟", "tried", "R2 full；盲区补全改用了 SD-Turbo（R5 generative），不推荐"]]],
      ["2 · 去掉台面杂物", [["Grounded-SAM 2 一次分割", "", "part", "实际用的是 SegFormer + Grounding-DINO"], ["跨帧跟踪，掩码外扩盖住阴影", "", "todo", ""], ["同上，用全部帧", "", "todo", ""]]],
      ["3 · 平整的房间外壳 + 物理检查", [["语义 RANSAC，墙互相垂直", "≈3 秒", "done", "所有路线；0 悬空，房间封闭"], ["SpatialLM / REST3D 识别通风柜、柜子、岛台", "≈15 秒", "todo", "R3 目前只是占位"], ["平整台面 + PlanarGS 处理复杂背景", "≈3 分钟", "todo", "试过 R4 高斯点，只有外观"]]],
      ["4 · 真实纹理", [["512 px/m 贴图 + LaMa 补洞", "≈15 秒", "done", "能用，但贴图看起来脏"], ["1024 px/m，曝光均衡，FLUX-Fill", "≈1.5 分钟", "todo", ""], ["2K–4K + 逆渲染得到 PBR 材质", "≈8 分钟", "alt", "改为加了 Blender 清理：干净材质、柜门、把手、灯（48 间里 35 间通过颜色检查）"]]],
      ["5 · 导出 OpenUSD + 质量检查", [["带碰撞体的 room.usd、layout_meta.json、质检渲染图", "", "done", "能在 Isaac Sim 5.1 里加载；每张台都做烧杯测试"], ["", "", "", ""], ["", "", "", ""]]]];
    var tierRuns = function (tier) { return Object.keys(T.results).filter(function (k) { var p = k.split("|"); return /^R[123]$/.test(p[1]) && p[2] === tier; }).map(function (k) { return build(T.results[k].tm); }); };
    var speeds = [["快", "30 秒 – 1 分钟", "fast"], ["中（主力生产档）", "2 – 5 分钟", "medium"], ["慢（精细档）", "10 – 25 分钟", "full"]].map(function (x) { var m = med(tierRuns(x[2])); return [x[0], x[1], m]; });
    var phases = [
      ["阶段 0", "环境、代码骨架、第一批素材", "done", "11-23"],
      ["阶段 1", "RGB 主干 + 快档端到端打通", "done", "6 间实验室、44 次运行（11-24）；但旧方法在测试房间上尺寸不过关"],
      ["阶段 2", "中档：更好的布局、尺度锚点、纹理质量", "part", "进行中：Depth Anything 3、完整相机求解、新的房间拟合（第 3 轮，测试房间已到 3%）；Blender 清理已完成"],
      ["阶段 3", "iPhone 17 Pro Max 输入 + 慢档", "todo", "需要你实地拍一间实验室"],
      ["阶段 4", "批量房间库 + 接入 SafeLab", "todo", ""]];
    var checks = [
      ["家具不悬空、不下沉（|z| < 1 mm）", "done", "每次运行都满足"],
      ["台面和地面平整", "done", "41 次几何运行中 40 次通过烧杯测试"],
      ["真实尺寸误差 ≤5%（RGB 输入）", "part", "旧方法不过：测试房间差 20–37%；新方法长、宽约 3%，还在开发"],
      ["去掉台面杂物", "part", ""],
      ["纹理真实、无重影", "part", "Blender 清理：48 间里 35 间通过颜色检查"],
      ["每档速度在预算内", "done", "各档都远低于预算（较重的中档、慢档步骤还没做）"]];
    return '<h3 class="r2c-h">我们的技术路线：4 种输入 × 3 个速度档</h3>' +
      '<p class="muted small">11-23 由 real2sim 代理和你一起定的方案。四种输入都先变成同一套标准关键帧，再经过五个阶段；每个阶段都有快、中、慢三种做法，最后都输出成能通过同一套物理检查的 Isaac Sim 房间（OpenUSD）。标签表示各部分现在的状态。</p>' +
      '<div class="r2c-inputs">' + inputs.map(function (x) { return '<div class="r2c-in"><b>' + esc(x[0]) + '</b><small>' + esc(x[1]) + "</small>" + st(x[2], x[3]) + "</div>"; }).join("") + "</div>" +
      '<div class="r2c-bundle">↓ <b>标准关键帧</b>（CaptureBundle）：快档 15–25 帧 · 中档 40–60 帧 · 慢档 80–150 帧 + 静态照片 ↓</div>' +
      '<div class="tscroll"><table class="cmp r2c-design"><thead><tr><th>阶段</th><th>⚡ 快</th><th>⚖ 中</th><th>🏆 慢</th></tr></thead><tbody>' +
      stages.map(function (r) { return "<tr><td><b>" + esc(r[0]) + "</b></td>" + r[1].map(function (c) { return c[0] ? "<td>" + esc(c[0]) + (c[1] ? ' <em class="r2c-t">' + esc(c[1]) + "</em>" : "") + "<br>" + st(c[2], c[3]) + "</td>" : '<td class="muted">同上</td>'; }).join("") + "</tr>"; }).join("") +
      "</tbody></table></div>" +
      '<div class="r2c-dgrid"><div><h4>每间房的速度：目标与实测</h4><table class="cmp"><thead><tr><th>档位</th><th>目标</th><th>实测构建</th></tr></thead><tbody>' +
        speeds.map(function (x) { return "<tr><td>" + esc(x[0]) + '</td><td class="num">' + esc(x[1]) + '</td><td class="num">' + (x[2] != null ? dur(x[2]) : "—") + "</td></tr>"; }).join("") +
        '</tbody></table><p class="muted small">实测：该档 R1–R3 构建时间的中位数，单张 GPU，另加约 2 分钟 Isaac Sim 检查。比目标快很多，是因为较重的中档、慢档步骤还没做。</p></div>' +
      '<div><h4>路线图</h4><ul class="r2c-list">' + phases.map(function (x) { return "<li><b>" + esc(x[0]) + "</b> " + esc(x[1]) + " " + st(x[2], x[3]) + "</li>"; }).join("") + "</ul></div>" +
      '<div><h4>每间房的验收项</h4><ul class="r2c-list">' + checks.map(function (x) { return "<li>" + esc(x[0]) + " " + st(x[1], x[2]) + "</li>"; }).join("") + "</ul></div></div>";
  }
  // The technical routes as pipelines: step 1 differs per route, steps 2-5 are shared; each box shows its typical (median) time.
  function pipeline() {
    var geo = Object.keys(T.results).map(function (k) { return T.results[k]; }).filter(function (R) { return R.tm && R.tm.st.shell_fit != null; });
    var chip = function (t, tool, time, cls) { return '<span class="r2c-chip' + (cls ? " " + cls : "") + '"><b>' + esc(t) + "</b>" + (tool ? "<small>" + esc(tool) + "</small>" : "") + (time || "") + "</span>"; };
    var arrow = '<i class="r2c-arr" aria-hidden="true">→</i>';
    var row = function (id, chips, tail) {
      return '<div class="r2c-prow" style="--rc:var(' + (RCOL[id] || "--muted") + ')"><div class="r2c-plabel"><b class="r2c-rid">' + esc(id) + "</b><span>" + esc(INFO[id].name) + '</span></div><div class="r2c-pchips">' + chips.join(arrow) + (tail ? arrow + tail : "") + "</div></div>";
    };
    var shared = chip("进入步骤 2–5", "", "", "r2c-to");
    var r1 = runsOf("R1"), r2 = runsOf("R2"), r3 = runsOf("R3"), r4 = runsOf("R4"), r5m = runsOf("R5").filter(function (R) { return R; });
    var r5box = Object.keys(T.results).filter(function (k) { return /\|R5\|manhattan$/.test(k); }).map(function (k) { return T.results[k]; });
    var r5gen = Object.keys(T.results).filter(function (k) { return /\|R5\|generative$/.test(k); }).map(function (k) { return T.results[k]; });
    return '<h3 class="r2c-h">阶段 1 和阶段 3 我们试了什么：路线 R1–R5</h3><p class="muted small">这批试验比较了从图片得到 3D（阶段 1）和拟合房间（阶段 3）的不同方法。每个框写着：做什么、这批运行用的工具、典型耗时（所有运行的中位数）。R1、R2、R3、R5 之后走相同的后续步骤。</p>' +
      '<div class="r2c-pipe">' +
      row("R1", [chip("图片或视频", ""), chip("逐像素深度", "Depth-Anything-V2 度量深度", sec(stageMed(r1, "depth_or_pose"))), chip("标注表面", "SegFormer、Grounding-DINO"), chip("3D 点", "")], shared) +
      row("R2", [chip("重叠照片或视频", ""), chip("跨照片匹配同一点，解出每个相机位置", "COLMAP / pycolmap，光束法平差", sec(stageMed(r2, "depth_or_pose"))), chip("逐张深度", "同 R1"), chip("同一坐标系下的 3D 点", "")], shared) +
      row("R3", [chip("R1 的 3D 点", ""), chip("拟合俯视矩形", "布局 AI 的临时替代（计划用 RoomFormer / Plane-DUSt3R）", sec(stageMed(r3, "depth_or_pose")))], shared) +
      row("R5", [chip("一张图", ""), chip("单图深度", "MoGe-2、Depth Anything"), chip("补出没拍到的墙", "盒子：延长看到的墙 " + (stageMed(r5box, "depth_or_pose") != null ? "≈ " + dur(stageMed(r5box, "depth_or_pose")) : "") + " · 图像 AI（SD-Turbo）" + (stageMed(r5gen, "depth_or_pose") != null ? "≈ " + dur(stageMed(r5gen, "depth_or_pose")) : ""))], shared) +
      row("R4", [chip("视频或大量照片", ""), chip("求解相机", "COLMAP", sec(stageMed(r4, "depth_or_pose"))), chip("训练照片级高斯点", "gsplat，30,000 步", sec(stageMed(r4, "render")))], chip("只有外观：没有表面，到此为止", "", "", "r2c-stop")) +
      '<div class="r2c-prow r2c-shared"><div class="r2c-plabel"><b>步骤 2–5</b><span>R1、R2、R3、R5 共用</span></div><div class="r2c-pchips">' +
        [chip("2 · 拟合干净的房间", "平整的地面、墙、天花板；实验台和通风柜做成盒子", sec(med(geo.map(function (R) { return R.tm.st.shell_fit; })))),
         chip("3 · 定真实尺寸", "用已知高度：台面 0.9 m、天花板、通风柜顶"),
         chip("4 · 用图片贴图", "纹理烘焙", sec(med(geo.map(function (R) { return R.tm.st.texture_bake; })))),
         chip("4b · 在 Blender 里清理", "新增：干净材质、柜门、把手、灯", "", "r2c-new"),
         chip("5 · Isaac Sim 检查", "加载房间，在每张台上放一个烧杯", sec(med(geo.map(function (R) { return R.tm.st.isaac_eval; }))))].join(arrow) + "</div></div></div>";
  }
  // How long a room takes: per route, build time (steps 1-4) median with fastest and slowest; the Isaac Sim check is extra and the same for every route.
  function timePanel() {
    var rows = ROUTES.map(function (id) {
      var b = runsOf(id).map(function (R) { return build(R.tm); }).filter(function (x) { return x != null; }).sort(function (x, y) { return x - y; });
      return { id: id, n: b.length, lo: b[0], hi: b[b.length - 1], m: med(b) };
    }).filter(function (r) { return r.n; });
    var top = Math.max.apply(null, rows.map(function (r) { return r.hi; }));
    var scale = function (x) { return (Math.sqrt(x) / Math.sqrt(top) * 100).toFixed(2) + "%"; };
    var iso = med(Object.keys(T.results).map(function (k) { var t = T.results[k].tm; return t ? t.st.isaac_eval : null; }));
    return '<h3 class="r2c-h">重建一间房要多久</h3><p class="muted small">构建时间指步骤 1–4，单张 GPU（RTX PRO 6000），按每条路线的全部运行统计：横条从最快一次画到最慢一次，圆点是中位数。每条路线另外都要加约 ' + dur(iso) + " 的 Isaac Sim 检查（主要花在启动 Isaac Sim 上）。横条用平方根刻度，长短时间都看得清。</p>" +
      '<div class="r2c-times">' + rows.map(function (r) {
        return '<div class="r2c-trow"><span><span class="r2sdot" style="background:var(' + (RCOL[r.id] || "--muted") + ')"></span><b>' + esc(r.id) + "</b> " + esc(INFO[r.id].name) + '</span><div class="r2c-track"><i class="r2c-range" style="left:' + scale(r.lo) + ";width:calc(" + scale(r.hi) + " - " + scale(r.lo) + ");background:var(" + (RCOL[r.id] || "--muted") + ')"></i><i class="r2c-med" style="left:' + scale(r.m) + ";border-color:var(" + (RCOL[r.id] || "--muted") + ')"></i></div><span class="num small">中位 <b>' + dur(r.m) + "</b> · " + dur(r.lo) + "–" + dur(r.hi) + " · " + r.n + " 次运行</span></div>";
      }).join("") + "</div>";
  }

  // Why the rooms come out wrong: error split on the test room (real2sim A, round 3f interim receipt, 2026-11-25 07:47 UTC).
  // Each step swaps in the true answer for one part; what still goes wrong is the remaining parts' fault.
  // err = room size error vs the visible room 15.8 x 9.8 x 3.4 m (length, width, height, %); b = benches found of 10; c = median bench-centre error (m).
  var ESPLIT = [
    { v: "旧方法（v1）：本页的实验室都是用它建的", rows: [
      ["相机靠估计", "R1 full：48 帧里只连上 11 帧", [36.0, 23.7, 1.8], 2, 2.54],
      ["相机靠估计", "R2 full：长得一样的台被配错，房间被撑到 25 m", [58.2, 138.5, 11.8], 2, 3.30],
      ["给真值相机", "深度 AI 和房间拟合还是旧的", [14.8, 1.0, 10.3], 7, 1.13],
      ["给真值相机 + 真值深度", "只剩旧的房间拟合", [21.1, 2.1, 10.3], 3, 0.53]] },
    { v: "新方法（v2）：开发中", rows: [
      ["相机靠估计", "48 帧全部连上（用 140 帧，GPU 光束法平差）", [3.0, 2.9, 5.0], 7, 0.47],
      ["给真值相机", "新深度 AI（Depth Anything 3 度量深度）和新的房间拟合", [3.0, 3.0, 0.3], 10, 0.64],
      ["给真值相机 + 真值深度", "只剩新的房间拟合", [3.4, 3.1, 1.2], 9, 0.29]] }];
  function errSplit() {
    var ok = function (b, t) { return '<td class="num" style="color:var(' + (b ? "--good" : "--bad") + ')">' + t + "</td>"; };
    return '<div class="r2c-esplit"><h3 class="r2c-h">房间为什么建不准：测试房间上的误差拆分 <span class="muted small">11-25</span></h3>' +
      '<p class="small">你的问题：是视频不够，还是图片不好？测试房间的视频很干净，11 张实验台能看到 10 张，所以 real2sim 代理把真值一部分一部分地换进去：先换成真值相机位置，再把深度也换成真值。换完以后还错的，就是剩下那部分的问题。绿色表示达标，红色表示不达标（房间长、宽误差 ≤10%，高 ≤5%；10 张台至少找到 8 张；台中心误差 ≤0.30 m）。</p>' +
      '<div class="tscroll"><table class="cmp"><thead><tr><th>给了哪些真值</th><th>运行</th><th>房间尺寸误差<br><span class="muted">长 / 宽 / 高</span></th><th>找到的实验台</th><th>台位置误差</th></tr></thead><tbody>' +
      ESPLIT.map(function (g) {
        return '<tr><th colspan="5" class="small">' + esc(g.v) + "</th></tr>" + g.rows.map(function (r) {
          var e = r[2];
          return "<tr><td><b>" + esc(r[0]) + '</b></td><td class="small muted">' + esc(r[1]) + "</td>" +
            '<td class="num">' + [[e[0], 10], [e[1], 10], [e[2], 5]].map(function (x) { return '<span style="color:var(' + (x[0] <= x[1] ? "--good" : "--bad") + ')">' + x[0].toFixed(1) + "%</span>"; }).join(" / ") + "</td>" +
            ok(r[3] >= 8, r[3] + " / 10") + ok(r[4] <= 0.30, r[4].toFixed(2) + " m") + "</tr>";
        }).join("");
      }).join("") + "</tbody></table></div>" +
      '<ul class="small"><li><b>不是视频的问题。</b>旧方法有三处短板，按影响从大到小：<b>相机位置</b>（R1 只连上 4–11 帧，房间大部分根本没进模型；R2 把长得一样的台配错，把房间撑到 25 m）；<b>房间拟合</b>（即使相机和深度都是真值，也把房间切短了 21%，10 张台只找到 3 张）；<b>深度 AI</b>，把距离整体压缩到真值的约 0.86。</li>' +
      "<li><b>新方法解决了大部分。</b>只用视频，测试房间的长、宽误差就在 3% 以内（旧方法差 36–58%）。给了真值相机和深度后，各项全部达标。</li>" +
      "<li><b>还要修的，按顺序：</b>一次急转弯（第 29–39 帧）之后相机轨迹漂了约 1 m，所以轨迹误差是 0.44 m，目标是 0.10 m；带回环的版本正在跑。然后是台的位置（0.64 m，目标 0.30 m）：一张 4.85 m 长的台被切成了两段。</li>" +
      "<li><b>真实实验室还有输入本身的限制：</b>论文插图少而且小（A-Lab 的只有 611 × 360 像素），Stanford 的照片跨了好几个房间。所以接下来做有完整漫游视频的实验室：你 11-25 选了 6 间（Jeffries-EL、Nolta/Fink、Wang、Krogstad、George、Heinrich），会用新方法建；下面这些房间之后也会用新方法重建。</li></ul></div>";
  }
  el.innerHTML = '<div class="block-head"><h2>Real2sim：把真实实验室的图片变成仿真房间</h2>' +
    "<p>先看我们的技术路线：四种输入、五个阶段，每个阶段有快、中、慢三种做法，以及各部分现在的状态。然后是我们在 6 间真实实验室和 1 间已知真实尺寸的测试房间上试过的五种方法（R1–R5）、各自要多久，以及每个场景的结果。</p></div>" +
    design() + pipeline() + timePanel() +
    '<div class="tscroll"><table class="cmp r2c-rt"><thead><tr><th>路线</th><th>步骤 1 怎么做</th><th>需要什么输入</th><th>示例：原图（左）→ 建出的结果（右）</th><th>现状</th></tr></thead><tbody>' +
    ROUTES.map(function (id) {
      var I = INFO[id], ex = exImg(I.ex), t = exTime(I.ex);
      return '<tr style="--rc:var(' + (RCOL[id] || "--muted") + ')"><td><b class="r2c-rid">' + esc(id) + "</b><br><b>" + esc(I.name) + "</b></td>" +
        '<td class="small">' + esc(I.plain) + '<details><summary class="muted">技术细节</summary><ul>' + I.tech.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></details></td>" +
        '<td class="small">' + esc(I.needs) + "</td>" +
        "<td>" + (ex ? '<a href="' + esc(ex) + '" target="_blank" rel="noopener"><img class="r2c-ex" loading="lazy" src="' + esc(ex) + '" alt="' + esc(id + " 示例") + '"></a><div class="muted small">' + esc(I.exCap) + (t != null ? " · 构建用时 " + dur(t) : "") + "</div>" : "—") + "</td>" +
        '<td class="small">' + esc(I.verdict) + "</td></tr>";
    }).join("") + "</tbody></table></div>" +
    '<p class="muted small">档位：<b>fast</b>（快）、<b>medium</b>（中）、<b>full</b>（全）用的帧越来越多、贴图越来越细（更慢，通常更好）。R5 不分档，而是两个版本：<b>manhattan</b>（盒子）和 <b>generative</b>（AI 画墙）。</p>' +
    '<div class="r2c-verdict small"><b>现状（11-25）：</b>本页所有房间都是用旧方法建的，在 16 m 长的测试房间上差了三分之一以上。新方法还在开发，只用视频就能把测试房间做到 3% 以内；相机轨迹和台的位置还要继续修（见下面的误差拆分）。' +
    "新方法上线之前：实验室视频用 R1，大量重叠照片用 R2，单张图用 R5 盒子版。<b>Blender 清理：已完成</b>（48 间里 35 间通过颜色检查）；下面的场景默认打开清理后的房间。接下来：每张照片视角的 Isaac Sim 渲染（已渲染完，正在加到页面上），以及用新方法做你选的 6 间视频实验室。</div>" +
    errSplit() +
    '<div class="r2c-clean"><h3 class="r2c-h">Blender 清理：前后对比 <span class="opst" style="--c:#1f9d55">已完成：48 间里 35 间通过</span></h3>' +
      '<p class="small">你的要求：房间看着脏。第二个 real2sim 代理在 Blender 里重做了两间房（按你的反馈做的第 2 版）：把糊成一片的照片贴图换成干净材质，颜色按照片里每个表面实测的颜色来调（色差 ΔE ≤ 10），并把照片里能看到的细节建回来：柜门、抽屉和把手、台面边缘、通风柜玻璃门和顶灯。几何和尺寸不变（0 mm），烧杯测试照样通过。前后两张图用同一个 Blender 相机和灯光。</p>' +
      '<div class="r2c-cleangrid">' + [["cwu_science_chem_lab_R2_fast", "CWU 实验室，R2 fast"], ["alab_lbnl_R1_fast", "A-Lab，R1 fast"]].map(function (x) {
        var b = "assets/r2s/clean_pilot/" + x[0];
        return '<figure><figcaption><b>' + esc(x[1]) + '</b> · <a href="' + b + '_sheet.jpg" target="_blank" rel="noopener">所有视角</a></figcaption><div class="r2c-ba"><div><span class="r2c-tag">清理前</span><img loading="lazy" src="' + b + '_before.jpg" alt="清理前"></div><div><span class="r2c-tag">清理后</span><img loading="lazy" src="' + b + '_after.jpg" alt="清理后"></div></div></figure>';
      }).join("") + "</div>" +
      '<p class="muted small">第 1 版丢了抽屉线、把手、灯和通风柜玻璃，还把 A-Lab 的深炭灰柜子做成了浅灰；第 2 版两处都修好了。细节只在照片里看得到的地方才加（A-Lab 的照片里没有顶灯和通风柜玻璃，所以没加）。全量已跑完：48 间里 35 间通过颜色检查（A-Lab 的柜子现在是中性灰）。在下面任一场景里，把步骤 2 切到<b>Blender 清理后</b>，就能看到每条路线清理后的样子；没通过的 13 间会写明原因。CWU 的 6 个照片视角全部重合，是因为那次运行的相机求解失败了（另一个问题）。</p></div>' +
    '<h3 class="r2c-h">逐个看场景</h3><p class="muted small">选一个场景：先看原始图片，再从同一视角看每条路线、看视频，以及在 3D 里看结果。</p>' +
    '<div class="r2c-scenes" role="tablist" aria-label="场景">' + scenes.map(function (s) {
      var th = s.gal[0] ? s.gal[0][0] : (s.runs[0] && img(s.runs[0].ims, "render_same_view")) || "";
      return '<button type="button" role="tab" class="r2c-scene" data-scene="' + esc(s.id) + '" aria-selected="false">' + (th ? '<img loading="lazy" src="' + esc(th) + '" alt="">' : "") +
        "<span><b>" + esc(s.name) + '</b><small>' + esc(KIND[s.kind] || s.kind) + " · " + s.runs.length + " 次运行</small></span></button>";
    }).join("") + "</div>" + '<div id="r2c-body"></div>';

  var viewer = null, cur = null, photo = 0, sel = null, snapTok = 0, mod = null, tab = "pics", mode = "orig";
  // Blender clean-up (real2sim-B): plain reasons for runs whose clean version was not accepted
  function cleanWhy(r) {
    var c = r.clean;
    if (!c) return r.route === "R4" ? "照片级高斯点不做清理（只有外观）" : "没有清理";
    if (c.st === "success") return "";
    var m = /threshold exceeded:\s*([a-z_]+)\s+([\d.]+)/i.exec(c.why || "");
    if (m) return "清理版未通过：颜色检查超限（" + m[1].replace("_", " ") + " ΔE " + (+m[2]).toFixed(1) + "，上限 10）";
    if (/at least 20/.test(c.why || "")) return "清理版未通过：重建的房间和照片 1 对不齐，没法拿它核对颜色" + (c.ref ? "（改用其他照片核对：最大色差 " + c.ref.max.toFixed(1) + (c.ref.ok ? "，在上限 10 以内）" : "，超过上限 10）") : "");
    return "清理版未通过" + (c.why ? "：" + c.why : "");
  }
  function cleanImg(r, cam) { var c = r.clean; if (!c || !c.ims) return null; var x = c.ims.filter(function (i) { return i[1] === cam; })[0]; return x ? x[0] : null; }
  function loadMod() { return mod ? Promise.resolve(mod) : import(new URL("assets/r2s_viewer.js" + (window.OL_BUILD ? "?v=" + window.OL_BUILD : ""), document.baseURI).href).then(function (m) { mod = m; return m; }); }
  function bg() { return getComputedStyle(document.documentElement).getPropertyValue("--surface-2").trim() || "#e2e6ed"; }

  function showScene(id) {
    var sc = scenes.filter(function (s) { return s.id === id; })[0] || scenes[0];
    cur = sc; photo = 0; sel = null; tab = "pics"; mode = sc.runs.some(function (r) { return r.clean && r.clean.glb; }) ? "clean" : "orig";
    el.querySelectorAll(".r2c-scene").forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-scene") === sc.id)); });
    if (viewer) { viewer.dispose(); viewer = null; }
    if (mod) mod.dropSnapshots();
    var ran = ROUTES.filter(function (id) { return sc.runs.some(function (r) { return r.route === id; }); });
    var routesLine = '<p class="small r2c-ran"><b>这里跑过的路线：</b>' + ran.map(function (id) { return dot(id) + esc(id) + " " + esc(INFO[id].name); }).join(" · ") +
      (sc.skip.length ? '<br><b>这里没跑的：</b>' + sc.skip.map(function (x) { return dot(x[0]) + esc(x[0]) + ' <span class="muted">（' + esc(ZH_INAP[x[1]] || x[1]) + "）</span>"; }).join("；") : "") + "</p>";
    var src;
    if (sc.test) {
      var c = sc.cov || {};
      src = '<p class="small">' + esc(sc.title) + "：在 Isaac Sim 里渲染的一段" + (c.path_m ? " " + Math.round(c.path_m) + " m 长的" : "") + "漫游视频，所以真实房间是已知的：<b>" + sc.truth.map(function (x) { return x.toFixed(1); }).join(" × ") + " m，" + esc(sc.benches) + " 张实验台</b>。" +
        (c.floor_pct != null ? "视频拍到了 " + Math.round(c.floor_pct) + "% 的地面、" + Math.round(c.walls_pct) + "% 的墙，" + esc(c.benches[1]) + " 张台里拍到 " + esc(c.benches[0]) + " 张。" : "") + "</p>" +
        (sc.gal.length ? photos(sc) : "") +
        (sc.cmp ? '<p class="small"><a href="' + esc(sc.cmp) + '" target="_blank" rel="noopener">打开代理做的对比图</a> <span class="muted">（所有路线拼在一张图里）</span></p>' : "");
    } else {
      src = '<p class="small"><b>' + esc(sc.title) + '</b> <span class="muted">· ' + esc(sc.inst) + "</span><br>" + esc(sc.cite) + " " +
        (sc.licOk ? chip("许可没问题", "#1f9d55", sc.lic) : chip("仅限内部研究", "#f08c00", sc.lic)) + "</p>" +
        (sc.url ? '<p><a class="r2c-btn" href="' + esc(sc.url) + '" target="_blank" rel="noopener noreferrer">' + (sc.kind === "video" ? "看原视频 ↗" : sc.kind === "paper_image" ? "打开论文 ↗" : "打开原始照片 ↗") + "</a>" +
          (sc.kind === "video" ? ' <span class="muted small">在公开来源打开；按许可，本站只放它的缩略图</span>' : "") + "</p>" : "") +
        photos(sc) + '<p class="muted small">选一张图，从它的视角对比。出处：' + esc(sc.gal[0] ? sc.gal[0][3] : sc.cite) + (sc.gal[0] && sc.gal[0][4] ? " · " + esc(sc.gal[0][4]) : "") + (sc.cmp ? ' · <a href="' + esc(sc.cmp) + '" target="_blank" rel="noopener">代理做的这间实验室对比图</a>' : "") + "</p>";
    }
    var nv = sc.runs.filter(function (r) { return r.vid; }).length;
    document.getElementById("r2c-body").innerHTML =
      '<div class="r2c-step"><h3><span class="r2c-n">1</span>来源</h3>' + src + routesLine + "</div>" +
      '<div class="r2c-step"><h3><span class="r2c-n">2</span>比较各路线</h3>' +
        (sc.runs.some(function (r) { return r.clean; }) ? '<div class="r2c-tabs r2c-mode" role="group" aria-label="房间版本"><button type="button" data-mode="orig" aria-pressed="' + (mode === "orig") + '">重建原样</button><button type="button" data-mode="clean" aria-pressed="' + (mode === "clean") + '">Blender 清理后（' + sc.runs.filter(function (r) { return r.clean && r.clean.st === "success"; }).length + " / " + sc.runs.filter(function (r) { return r.route !== "R4"; }).length + " 通过）</button></div>" : "") +
        '<div class="r2c-tabs" role="tablist"><button type="button" role="tab" data-tab="pics" aria-selected="true">同视角：图片</button><button type="button" role="tab" data-tab="vids" aria-selected="false">视频（' + nv + "）</button></div>" +
        '<div id="r2c-pics"><p class="muted small" id="r2c-gridnote"></p><div class="r2c-grid" id="r2c-grid"></div></div><div id="r2c-videos" hidden></div>' + sceneTimes(sc) + "</div>" +
      '<div class="r2c-step"><h3><span class="r2c-n">3</span><span id="r2c-selname">在上面选一条路线</span> <span class="muted small">在线 3D</span></h3><div class="r2c-sel">' +
        '<div><div class="r2sstage" id="r2c-stage"><p class="r2smsg" id="r2c-msg">在步骤 2 里选一条路线。</p><p class="r2shud small" id="r2c-hud"></p></div><div class="r2sviews" id="r2c-views" role="group" aria-label="视角"></div></div>' +
        '<div class="r2c-facts" id="r2c-facts"></div></div></div>';
    grid(); videos();
    var first = sc.runs.filter(function (r) { return r.route === "R2" && r.w3d; })[0] || sc.runs.filter(function (r) { return r.w3d; })[0] || sc.runs[0];
    if (first) pick(first.key, false);
  }
  function sceneTimes(sc) {
    var rs = sc.runs.filter(function (r) { return r.tm && r.tm.wall != null; });
    if (!rs.length) return "";
    var top = Math.max.apply(null, rs.map(function (r) { return r.tm.wall; }));
    return '<div class="r2c-stime"><h4>这个场景的耗时 <span class="muted small">每次运行，单张 GPU：先构建（步骤 1–4），再做 Isaac Sim 检查</span></h4>' + rs.map(function (r) {
      var b = build(r.tm), c = r.tm.wall - b;
      return '<div class="r2c-trow"><span>' + dot(r.route) + "<b>" + esc(r.route) + "</b> " + esc(r.tier) + '</span><div class="r2c-bar2"><i style="width:' + (b / top * 100).toFixed(2) + "%;background:var(" + (RCOL[r.route] || "--muted") + ')" title="构建 ' + dur(b) + '"></i><i style="width:' + (c / top * 100).toFixed(2) + '%" class="r2c-chk" title="Isaac Sim 检查 ' + dur(c) + '"></i></div><span class="num small">构建 <b>' + dur(b) + "</b> · 合计 " + dur(r.tm.wall) + "</span></div>";
    }).join("") + "</div>";
  }
  function photos(sc) {
    return '<div class="r2c-photos" role="group" aria-label="选图片">' + sc.gal.map(function (g, i) {
      return '<button type="button" class="r2c-photo" data-photo="' + i + '" aria-pressed="' + (i === 0) + '"><img loading="lazy" src="' + esc(g[0]) + '" alt="' + esc(g[1] || "源图 " + (i + 1)) + '"><span>' + (sc.test ? "帧 " : "照片 ") + (i + 1) + "</span></button>";
    }).join("") + "</div>";
  }

  // ---- step 2, pictures: original | per route: Isaac Sim render and online render from the same camera
  function grid() {
    var sc = cur, g = sc.gal[photo], tok = ++snapTok, cam = "src_cam_" + photo;
    var cells = (g ? ['<figure class="r2c-cell r2c-orig"><img src="' + esc(g[0]) + '" alt="原图"><figcaption><b>原图</b> ' + (sc.test ? "帧 " : "照片 ") + (photo + 1) + "</figcaption></figure>"] : []).concat(sc.runs.map(function (r) {
      var isaac = img(r.ims, "isaac_view", cam), sbs = photo === 0 ? img(r.ims, "render_same_view") : null;
      var iso = isaac ? '<img loading="lazy" src="' + esc(isaac) + '" alt="Isaac Sim 渲染">' : sbs ? '<img loading="lazy" src="' + esc(sbs) + '" alt="Isaac Sim，与原图并排">' : "";
      if (mode === "clean") { var bl = cleanImg(r, cam); iso = ""; var why = cleanWhy(r);
        r._top = (bl ? '<div class="r2c-img"><span class="r2c-tag">Blender 清理后' + (why ? " · 未通过" : "") + '</span><img loading="lazy" src="' + esc(bl) + '" alt="清理后的房间，Blender 渲染"></div>' : "") + (why ? '<div class="r2c-why small muted">' + esc(why) + "</div>" : ""); } else r._top = "";
      return '<figure class="r2c-cell" data-run="' + esc(r.key) + '" tabindex="0" role="button" aria-pressed="' + (sel === r.key) + '"><figcaption>' + dot(r.route) + "<b>" + esc(r.route) + "</b> " + esc((INFO[r.route] || {}).name || "") + '<br><span class="muted">' + esc(r.tier) + " · 构建用时 " + dur(build(r.tm)) + "</span></figcaption>" +
        '<div class="r2c-pair">' + r._top + (iso ? '<div class="r2c-img"><span class="r2c-tag">Isaac Sim' + (!isaac && sbs ? " · 左：原图" : "") + "</span>" + iso + "</div>" : "") +
        '<div class="r2c-img" id="snap-' + esc(r.key.replace(/\|/g, "-")) + '"><span class="r2c-tag">在线</span><span class="muted small">渲染中…</span></div></div></figure>';
    }));
    document.getElementById("r2c-grid").innerHTML = cells.join("");
    document.getElementById("r2c-gridnote").textContent = mode === "clean" ? "第一张是原" + (sc.test ? "视频帧" : "图") + "；后面是每条路线经过 Blender 清理后的结果，相机相同：上面是 Blender 渲染，下面是清理后的 3D 模型在线渲染。点一条路线，就在 3D 里打开清理后的房间。" : (g ? "第一张是原" + (sc.test ? "视频帧" : "图") + "；后面是每条路线建出的结果，从同一个相机看：在你的浏览器里在线渲染" + (photo === 0 ? "，以及 Isaac Sim 渲染（代理做的，左半边是原图）" : "；每张照片视角的 Isaac Sim 渲染正在加上") + "。点一条路线，在下面用 3D 打开。" : "每条路线的 Isaac Sim 渲染和在线渲染。点一条路线，在下面用 3D 打开。") +
      (sc.test ? "这里用的是视频里的真实相机。如果某条路线把房间建小了或建偏了，这个相机就会落在墙上或房间外面，于是只看到近处的一面墙，或什么都看不到：这正是这条路线的误差。" : "");
    var w = 420, h = 236, orig = el.querySelector(".r2c-orig img");
    var go = function () {
      if (orig && orig.naturalWidth) h = Math.max(150, Math.min(420, Math.round(w * orig.naturalHeight / orig.naturalWidth)));
      loadMod().then(function (m) {
        var seq = Promise.resolve();
        sc.runs.forEach(function (r) {
          seq = seq.then(function () {
            if (tok !== snapTok) return;
            var box = document.getElementById("snap-" + r.key.replace(/\|/g, "-")); if (!box) return;
            var none = function (t) { box.innerHTML = '<span class="r2c-tag">在线</span><span class="muted small">' + esc(t) + "</span>"; };
            var w3 = mode === "clean" ? (r.clean && r.clean.glb) : r.w3d;
            if (mode === "clean" && !w3) { none(cleanWhy(r) || "没有清理后的 3D 文件"); return; }
            if (!w3) { none(sc.test ? "测试房间的 3D 文件正在做" : "没有 3D 文件"); return; }
            if (w3.fmt !== "glb") { none("照片级高斯点：在下面用 3D 打开"); return; }
            return m.snapshot(w3.p, photo, w, h, bg(), mode === "clean").then(function (url) {
              if (tok !== snapTok) return;
              if (url) box.innerHTML = '<span class="r2c-tag">在线</span><img src="' + url + '" alt="' + esc(r.route + " " + r.tier + "，在线渲染") + '">';
              else none("这条路线没用到第 " + (photo + 1) + (sc.test ? " 帧" : " 张照片"));
            }, function () { none("渲染失败"); });
          });
        });
      });
    };
    if (orig && !orig.complete) orig.addEventListener("load", go, { once: true }); else go();
  }

  // ---- step 2, videos
  function videos() {
    var vs = cur.runs.filter(function (r) { return r.vid; }), box = document.getElementById("r2c-videos");
    if (!vs.length) { box.innerHTML = '<p class="muted small">这个场景还没有视频。</p>'; return; }
    box.innerHTML = '<p><button type="button" class="r2s3dbtn" id="r2c-playall">全部一起播放</button> <span class="muted small">' + (cur.test ? "左：原视频；右：沿同一条相机路径看重建的房间（2 倍速）" : "每条路线重建的房间，同一段飞行路径" + (cur.kind === "video" ? "；实验室原视频的链接在步骤 1" : "")) + "</span></p>" +
      '<div class="r2c-vids' + (cur.test ? " wide" : "") + '">' + vs.map(function (r) { return '<figure><video muted playsinline controls preload="metadata" src="' + esc(r.vid) + '"></video><figcaption>' + dot(r.route) + "<b>" + esc(r.route) + "</b> " + esc(r.tier) + "</figcaption></figure>"; }).join("") + "</div>";
    document.getElementById("r2c-playall").addEventListener("click", function () { box.querySelectorAll("video").forEach(function (v) { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); }); });
  }
  function setTab(t) {
    tab = t;
    el.querySelectorAll(".r2c-tabs [data-tab]").forEach(function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-tab") === t)); });
    document.getElementById("r2c-pics").hidden = t !== "pics"; document.getElementById("r2c-videos").hidden = t !== "vids";
    if (t !== "vids") document.querySelectorAll("#r2c-videos video").forEach(function (v) { v.pause(); });
  }

  // ---- step 3: the selected route in 3D (online) with its numbers
  function pick(key, scroll) {
    var r = cur.runs.filter(function (x) { return x.key === key; })[0]; if (!r) return;
    sel = key;
    el.querySelectorAll(".r2c-cell[data-run]").forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-run") === key)); });
    document.getElementById("r2c-selname").innerHTML = dot(r.route) + esc(r.route + " " + r.tier) + ' <span class="muted small">' + esc((INFO[r.route] || {}).name || "") + "</span>";
    var s = img(r.ims, "render_same_view");
    document.getElementById("r2c-facts").innerHTML = '<dl class="r2c-dl">' + facts(cur, r).map(function (x) { return "<dt>" + x[0] + "</dt><dd>" + x[1] + "</dd>"; }).join("") + "</dl>" +
      (s ? '<a class="r2c-sheet" href="' + esc(s) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(s) + '" alt=""><span>Isaac Sim 并排对比：左边是原图，右边是这条路线</span></a>' : "") +
      (r.vid ? '<video class="r2c-selvid" muted playsinline controls preload="metadata" src="' + esc(r.vid) + '"></video>' : "") +
      (r.verdict ? '<p class="small muted">' + esc(r.verdict) + "</p>" : "");
    var msg = document.getElementById("r2c-msg"), views = document.getElementById("r2c-views"), wrap = el.querySelector(".r2c-sel");
    var w3 = mode === "clean" && r.clean && r.clean.glb ? r.clean.glb : r.w3d;
    wrap.classList.toggle("no3d", !w3);
    if (!w3) { if (viewer) { viewer.dispose(); viewer = null; } views.innerHTML = ""; return; }
    loadMod().then(function (m) {
      if (!viewer) viewer = m.mount(document.getElementById("r2c-stage"), { views: views, msg: msg, hud: document.getElementById("r2c-hud") });
      var ex = r.m && r.m["texture.evaluation_validity"] === "registration_failed_excluded", hp = r.m ? num(r.m["texture.heldout_psnr_db"]) : null;
      return viewer.open({ label: r.route + " " + r.tier + (w3 !== r.w3d ? "（清理后）" : ""), w3d: w3, lit: w3 !== r.w3d, note: r.route === "R4" ? (ex ? "配准失败，不计入" : hp != null ? hp.toFixed(1) + " dB（未参与训练的视角）" : "") : "" }).then(function () { if (w3.fmt === "glb" && viewer.photo) viewer.photo(photo); });
    });
    if (scroll) { var st = document.getElementById("r2c-stage"); if (st) st.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  }

  el.addEventListener("click", function (e) {
    var s = e.target.closest("[data-scene]"); if (s) { showScene(s.getAttribute("data-scene")); return; }
    var t = e.target.closest("[data-tab]"); if (t) { setTab(t.getAttribute("data-tab")); return; }
    var md = e.target.closest("[data-mode]");
    if (md) { mode = md.getAttribute("data-mode"); el.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === md)); }); setTab("pics"); grid(); if (sel) pick(sel, false); return; }
    var p = e.target.closest("[data-photo]");
    if (p) { photo = +p.getAttribute("data-photo"); el.querySelectorAll(".r2c-photo").forEach(function (b) { b.setAttribute("aria-pressed", String(b === p)); }); setTab("pics"); grid(); if (viewer && viewer.photo) viewer.photo(photo); return; }
    var c = e.target.closest(".r2c-cell[data-run]"); if (c) { pick(c.getAttribute("data-run"), true); }
  });
  el.addEventListener("keydown", function (e) { var c = e.target.closest && e.target.closest(".r2c-cell[data-run]"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(c.getAttribute("data-run"), true); } });
  showScene(scenes[0].id);
})();
