/* Real2sim trials on real labs (owner request 11-23): 6 labs x technical routes, built from data/r2s_trials.js */
(function () {
  var T = window.R2S_TRIALS, el = document.getElementById("r2strials"), esc = window.OL ? window.OL.esc : function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  if (!el || !T) return;
  var TYPE = { paper_image: "Paper photos", photo: "Web photos", video: "Video" };
  var ST = { planned: ["#8a8f98", "planned"], running: ["#2f7fd8", "running"], done: ["#1f9d55", "done"], failed: ["#d6336c", "failed"] };
  var byLab = {}; T.labs.forEach(function (l) { byLab[l.id] = l; });
  var n = { planned: 0, running: 0, done: 0, failed: 0 }; T.runs.forEach(function (r) { n[r.st] = (n[r.st] || 0) + 1; });
  var inap = {}; T.inap.forEach(function (x) { inap[x[0] + "|" + x[1]] = x[2]; });
  function chip(st, txt, tip) { var c = ST[st] || ["#8a8f98", st]; return '<span class="opst" style="--c:' + c[0] + '"' + (tip ? ' title="' + esc(tip) + '"' : "") + ">" + esc(txt || c[1]) + "</span>"; }
  function licChip(l) { return l.lic_st === "permissive" ? '<span class="opst" style="--c:#1f9d55" title="' + esc(l.lic) + '">licence OK</span>' : '<span class="opst" style="--c:#f08c00" title="' + esc(l.lic) + '">licence: your call</span>'; }
  var html = '<div class="block-head"><h2>Trials on real labs</h2><p>Your request of 11-23: six real laboratories (two from paper photos, two from web photos, two from videos), each rebuilt by several technical routes so you can compare them. Run by the real2sim agent; HQ updates this page as results arrive.</p></div>' +
    '<p class="small"><b>' + T.labs.length + " labs · " + T.routes.length + " routes · " + T.runs.length + " runs</b>: " + ["done", "running", "failed", "planned"].filter(function (k) { return n[k]; }).map(function (k) { return chip(k, n[k] + " " + k); }).join(" ") +
      ' <span class="muted">· agent update ' + esc(T.src_updated.replace("T", " ").slice(0, 16)) + " UTC</span></p>";
  html += '<div class="r2slabs">' + T.labs.map(function (l) {
    return '<div class="r2slab" id="lab-' + esc(l.id) + '">' + (l.thumb ? '<img loading="lazy" src="' + esc(l.thumb) + '" alt="' + esc(l.title) + '">' : "") +
      '<div class="small"><span class="opst" style="--c:#6c5ce7">' + esc(TYPE[l.type] || l.type) + "</span> " + licChip(l) + (l.area ? ' <span class="muted">≈' + esc(l.area) + " m²</span>" : "") + "</div>" +
      "<b>" + esc(l.title) + '</b><div class="small muted">' + esc(l.inst) + "</div>" +
      '<div class="small">' + esc(l.cite) + (l.url ? ' · <a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">source</a>' : "") + "</div>" +
      '<details class="small"><summary>Why this lab, scale references, privacy</summary><p>' + esc(l.why) + "</p><p><b>Scale references:</b> " + esc(Array.isArray(l.anchors) ? l.anchors.join("; ") : l.anchors) + "</p><p><b>Media:</b> " + esc(l.media) + "</p><p><b>Licence:</b> " + esc(l.lic) + "</p><p><b>Privacy:</b> " + esc(l.privacy) + "</p></details></div>";
  }).join("") + "</div>";
  // labs x routes matrix
  html += '<h3 class="r2sh">Which route ran where</h3><div class="tscroll"><table class="cmp r2smx"><thead><tr><th>Lab</th>' + T.routes.map(function (r) { return '<th title="' + esc(r.method) + '">' + esc(r.id) + "<div class=\"small muted\">" + esc(r.name) + "</div></th>"; }).join("") + "</tr></thead><tbody>" +
    T.labs.map(function (l) {
      return "<tr><td><a href=\"#lab-" + esc(l.id) + '">' + esc(l.title.split(/[—:(]/)[0]) + '</a><div class="small muted">' + esc(TYPE[l.type] || l.type) + "</div></td>" + T.routes.map(function (r) {
        var rs = T.runs.filter(function (x) { return x.lab === l.id && x.route === r.id; });
        if (!rs.length) { var why = inap[l.id + "|" + r.id]; return '<td class="muted small"' + (why ? ' title="' + esc(why) + '"' : "") + ">" + (why ? "not applicable" : "—") + "</td>"; }
        return "<td>" + rs.map(function (x) { var k = x.lab + "|" + x.route + "|" + x.tier; return (T.results[k] ? '<a href="#res-' + esc(k.replace(/\|/g, "-")) + '">' : "") + chip(x.st, x.tier, x.why) + (T.results[k] ? "</a>" : ""); }).join(" ") + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody></table></div>" +
    '<p class="muted small">Hover a column for its method, a cell for why a route does not apply. Tiers: fast / medium / full speed-quality, or the two completion strategies of R5.</p>';
  // results, lab by lab: original material -> time per route -> 3D -> result cards
  var keys = Object.keys(T.results);
  var STAGES = [["ingest", "Ingest", "--idle"], ["depth_or_pose", "Depth / poses", "--accent"], ["shell_fit", "Shell fit", "--s1"], ["texture_bake", "Texture bake", "--s2"],
    ["usd_export", "USD export", "--muted"], ["isaac_eval", "Isaac Sim check (same for every route)", "--good"], ["render", "Render", "--warn"]];
  var RCOL = { R1: "--s1", R2: "--accent", R3: "--s2", R4: "--s3", R5: "--warn" };
  var TIERS = ["fast", "medium", "full", "manhattan", "generative"];
  function short(l) { return String(l.title || l.id).split(/[—:(]/)[0].trim(); }
  function dur(s) { if (s == null) return "—"; s = Math.round(s); var m = Math.floor(s / 60), r = s % 60; return m ? m + "m " + (r < 10 ? "0" : "") + r + "s" : r + "s"; }
  function labKeys(lid) {
    return keys.filter(function (k) { return k.split("|")[0] === lid; }).sort(function (a, b) {
      var x = a.split("|"), y = b.split("|"); return x[1] < y[1] ? -1 : x[1] > y[1] ? 1 : TIERS.indexOf(x[2]) - TIERS.indexOf(y[2]);
    });
  }
  function resultCard(k) {
    var R = T.results[k], p = k.split("|"), l = byLab[p[0]] || { title: p[0] };
    return '<div class="r2sres" id="res-' + esc(k.replace(/\|/g, "-")) + '"><b><span class="r2sdot" style="background:var(' + (RCOL[p[1]] || "--muted") + ')"></span>' + esc(short(l)) + " · " + esc(p[1]) + " " + esc(p[2]) + "</b>" +
      (R.w3d ? ' <button type="button" class="r2s3dbtn" data-r2s3d="' + esc(k) + '">View in 3D · ' + esc(R.w3d.mb) + " MB</button>" : "") +
      (R.verdict ? '<p class="small">' + esc(R.verdict) + "</p>" : "") +
      (R.ims.length ? '<div class="shoot">' + R.ims.map(function (im) { return '<a href="' + esc(im[0]) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(im[0]) + '" alt="' + esc(im[1]) + '"><span>' + esc(im[1] || im[2]) + "</span></a>"; }).join("") + "</div>" : "") +
      (R.vid ? '<video class="shootvid" controls preload="none" playsinline src="' + esc(R.vid) + '"></video>' : "") +
      '<details class="small"><summary>Measurements</summary><table class="cmp"><tbody>' + Object.keys(R.m).map(function (mk) { return "<tr><td>" + esc(mk.replace(/_/g, " ")) + "</td><td>" + esc(String(R.m[mk])) + "</td></tr>"; }).join("") + "</tbody></table></details>" +
      (R.fail.length ? '<details class="small"><summary>Failure cases (' + R.fail.length + ")</summary><ul>" + R.fail.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></details>" : "") + "</div>";
  }
  function timeChart(ks) {
    var rows = ks.filter(function (k) { return T.results[k].tm && T.results[k].tm.wall; });
    if (!rows.length) return '<p class="muted small">Stage times are not in this data yet.</p>';
    var max = Math.max.apply(null, rows.map(function (k) { return T.results[k].tm.wall; }));
    var raw = max / 4, p10 = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / p10, step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p10, top = Math.ceil(max / step) * step, ticks = [];
    for (var v = 0; v <= top + 1e-9; v += step) ticks.push(v);
    var pct = function (x) { return (x / top * 100).toFixed(3) + "%"; };
    var load = rows.some(function (k) { return T.results[k].tm.load; });
    return '<div class="r2slegend small">' + STAGES.map(function (s) { return '<span><i style="background:var(' + s[2] + ')"></i>' + s[1] + "</span>"; }).join("") + '<span><i style="background:var(--track)"></i>Other / model load</span></div>' +
      '<div class="r2stime">' + rows.map(function (k) {
        var t = T.results[k].tm, p = k.split("|"), known = 0;
        var segs = STAGES.map(function (s) { var x = t.st[s[0]]; if (!(x > 0)) return ""; known += x; return '<i style="width:' + pct(x) + ";background:var(" + s[2] + ')" title="' + esc(s[1] + ": " + dur(x)) + '"></i>'; }).join("");
        var rest = Math.max(0, t.wall - known);
        return '<div class="r2strow"><span class="small"><span class="r2sdot" style="background:var(' + (RCOL[p[1]] || "--muted") + ')"></span><b>' + esc(p[1]) + '</b> <span class="muted">' + esc(p[2]) + "</span></span>" +
          '<div class="r2sbar" role="img" aria-label="' + esc(p[1] + " " + p[2] + ": " + dur(t.wall)) + '">' + segs + (rest > 0.5 ? '<i style="width:' + pct(rest) + ';background:var(--track)" title="other: ' + esc(dur(rest)) + '"></i>' : "") + "</div>" +
          '<span class="small num">build ' + dur(t.wall - (t.st.isaac_eval || 0)) + ' · total ' + dur(t.wall) + "</span></div>";
      }).join("") + '<div class="r2strow r2saxis"><span></span><div>' + ticks.map(function (x) { return '<span style="left:' + pct(x) + '">' + dur(x) + "</span>"; }).join("") + "</div><span></span></div></div>" +
      (load ? '<p class="muted small">Wall-clock on one ' + esc(T.results[rows[0]].tm.gpu || "GPU") + ", including model loading, which weighs most on the fast routes.</p>" : "");
  }
  // scorecards: the numbers that decide between routes (round-2 measurement fixes are in RESULT.json)
  function mv(k, name) { var R = T.results[k]; return R && R.m ? R.m[name] : undefined; }
  function num(v) { return typeof v === "number" && isFinite(v) ? v : null; }
  function build(k) { var t = T.results[k].tm; if (!t || t.wall == null) return null; return t.wall - (t.st.isaac_eval || 0); }
  function score(k) {
    var p = k.split("|"), dims = [num(mv(k, "geometry.length_m")), num(mv(k, "geometry.width_m")), num(mv(k, "geometry.height_m"))];
    var ok = mv(k, "usability.beaker_100ml_2s_test.all_passed_le_2mm"), nb = num(mv(k, "usability.beaker_100ml_2s_test.benches_tested"));
    return { k: k, route: p[1], tier: p[2], build: build(k), total: T.results[k].tm ? T.results[k].tm.wall : null,
      dims: dims[0] != null ? dims : null, scaleSt: mv(k, "scale.scale_status"), scale: num(mv(k, "scale.error_pct")), anchors: num(mv(k, "scale.anchor_count")), why: mv(k, "scale.status_reason") || mv(k, "scale.anchor_detail"),
      dev: num(mv(k, "geometry.cross_route_consistency.max_dim_dev_pct")), fit: num(mv(k, "geometry.shell_residuals.overall.p50_cm")), fit5: num(mv(k, "geometry.shell_residuals.overall.inlier_5cm_pct")),
      photo: num(mv(k, "texture.observed_ratio")), psnr: num(mv(k, "texture.train_psnr_db")), hpsnr: num(mv(k, "texture.heldout_psnr_db")), excl: mv(k, "texture.evaluation_validity") === "registration_failed_excluded", beaker: nb ? (ok === true || ok === "True") : null, w3d: T.results[k].w3d };
  }
  function bestOf(rows, f, low) { var v = rows.map(f).filter(function (x) { return x != null; }); if (!v.length) return null; return low ? Math.min.apply(null, v) : Math.max.apply(null, v); }
  function mark(v, best, txt) { return v != null && best != null && v === best ? '<b class="r2sbest" title="best on this lab">' + txt + "</b>" : txt; }
  function scorecard(ks) {
    var rows = ks.map(score);
    var bB = bestOf(rows, function (r) { return r.build; }, true), bS = bestOf(rows, function (r) { return r.scaleSt === "anchored" ? r.scale : null; }, true),
      bD = bestOf(rows, function (r) { return r.dev; }, true), bF = bestOf(rows, function (r) { return r.fit; }, true), bP = bestOf(rows, function (r) { return r.photo; }, false);
    return '<div class="tscroll"><table class="cmp r2sscore"><thead><tr><th>Run</th><th title="Total time minus the shared Isaac Sim check">Build time</th><th>Room L × W × H</th><th title="Error of the scale against reference objects in the pictures">Scale error</th>' +
      '<th title="How far this room\'s largest dimension is from the median of all routes on this lab">Size vs other routes</th><th title="Median distance from the source\'s 3D points to the room shell; share of points within 5 cm">Fit to source points</th>' +
      '<th title="Share of the wall, floor and bench texture taken from real pictures (the rest is filled in)">Texture from pictures</th><th>Beaker test</th></tr></thead><tbody>' +
      rows.map(function (r) {
        var sc = r.route === "R4" ? '<span class="muted">appearance only</span>' : r.scaleSt === "unanchored" ? '<span class="opst" style="--c:#f08c00" title="' + esc(r.why || "Fewer than two reference objects, or the scale hit its limit") + '">not anchored</span>' :
          r.scaleSt === "inconsistent" ? '<span class="opst" style="--c:#d6336c" title="' + esc(r.why || "") + '">references disagree' + (r.scale != null ? " (" + r.scale.toFixed(0) + "%)" : "") + "</span>" :
          r.scale != null ? mark(r.scale, bS, r.scale.toFixed(1) + "%") + ' <span class="muted small" title="' + esc(r.why || "") + '">' + (r.anchors != null ? r.anchors + " ref" + (r.anchors === 1 ? "" : "s") : "") + "</span>" : "—";
        return '<tr><td><a href="#res-' + esc(r.k.replace(/\|/g, "-")) + '"><span class="r2sdot" style="background:var(' + (RCOL[r.route] || "--muted") + ')"></span>' + esc(r.route) + " " + esc(r.tier) + "</a></td>" +
          '<td class="num">' + (r.build != null ? mark(r.build, bB, dur(r.build)) : "—") + (r.total != null ? ' <span class="muted small">/ ' + dur(r.total) + "</span>" : "") + "</td>" +
          '<td class="num">' + (r.dims ? r.dims.map(function (x) { return x.toFixed(1); }).join(" × ") + " m" : (r.excl ? '<span class="opst" style="--c:#d6336c" title="Only a few frames registered, so the model memorised them">registration failed, excluded</span>' : r.hpsnr != null ? '<span class="muted">' + r.hpsnr.toFixed(1) + " dB on held-out views</span>" : r.psnr != null ? '<span class="muted">' + r.psnr.toFixed(1) + " dB (training views)</span>" : "—")) + "</td>" +
          '<td class="num">' + sc + "</td><td class=\"num\">" + (r.dev != null ? mark(r.dev, bD, r.dev.toFixed(1) + "%") : "—") + "</td>" +
          '<td class="num">' + (r.fit != null ? mark(r.fit, bF, r.fit.toFixed(0) + " cm") + (r.fit5 != null ? ' <span class="muted small">' + r.fit5.toFixed(0) + "% ≤5 cm</span>" : "") : "—") + "</td>" +
          '<td class="num">' + (r.photo != null ? mark(r.photo, bP, Math.round(r.photo * 100) + "%") : "—") + "</td>" +
          "<td>" + (r.beaker === true ? '<span class="opst" style="--c:#1f9d55">pass</span>' : r.beaker === false ? '<span class="opst" style="--c:#d6336c">fail</span>' : '<span class="muted small">no collision</span>') + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="muted small">Bold is the best value on this lab. Scale error compares the room with reference objects in the pictures (bench, ceiling, hood): "not anchored" means fewer than two references or the scale hit its limit, "references disagree" means two references gave sizes more than 25% apart. The exact-answer check above shows that even anchored runs can be a third off. None of these real labs has a measured answer, so use the exact-answer check above to judge size.</p>';
  }
  function median(a) { a = a.filter(function (x) { return x != null; }).sort(function (x, y) { return x - y; }); if (!a.length) return null; var h = Math.floor(a.length / 2); return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2; }
  function routeSummary() {
    var rows = T.routes.map(function (r) {
      var sc = keys.filter(function (k) { return k.split("|")[1] === r.id; }).map(score);
      var anch = sc.filter(function (s) { return s.scaleSt === "anchored"; });
      var bt = sc.filter(function (s) { return s.beaker != null; });
      return { id: r.id, name: r.name, n: sc.length, labs: sc.map(function (s) { return s.k.split("|")[0]; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).length,
        build: median(sc.map(function (s) { return s.build; })), anch: anch.length, scale: median(anch.map(function (s) { return s.scale; })),
        dev: median(sc.map(function (s) { return s.dev; })), fit: median(sc.map(function (s) { return s.fit; })), photo: median(sc.map(function (s) { return s.photo; })),
        pass: bt.filter(function (s) { return s.beaker; }).length, tested: bt.length, geo: sc.some(function (s) { return s.dims; }) };
    });
    var bB = bestOf(rows, function (r) { return r.build; }, true), bS = bestOf(rows, function (r) { return r.scale; }, true), bD = bestOf(rows, function (r) { return r.dev; }, true),
      bF = bestOf(rows, function (r) { return r.fit; }, true), bP = bestOf(rows, function (r) { return r.photo; }, false);
    return '<div class="tscroll"><table class="cmp r2sscore"><thead><tr><th>Route</th><th>Runs</th><th>Median build time</th><th>Scale anchored</th><th>Median scale error</th><th>Median size vs other routes</th><th>Median fit to source points</th><th>Median texture from pictures</th><th>Beaker test</th></tr></thead><tbody>' +
      rows.map(function (r) {
        return '<tr><td><span class="r2sdot" style="background:var(' + (RCOL[r.id] || "--muted") + ')"></span><b>' + esc(r.id) + "</b> " + esc(r.name) + "</td>" +
          '<td class="num">' + r.n + ' <span class="muted small">on ' + r.labs + " lab" + (r.labs === 1 ? "" : "s") + "</span></td>" +
          '<td class="num">' + (r.build != null ? mark(r.build, bB, dur(r.build)) : "—") + "</td>" +
          '<td class="num">' + (r.geo ? r.anch + " / " + r.n : '<span class="muted">—</span>') + "</td>" +
          '<td class="num">' + (r.scale != null ? mark(r.scale, bS, r.scale.toFixed(1) + "%") : "—") + "</td>" +
          '<td class="num">' + (r.dev != null ? mark(r.dev, bD, r.dev.toFixed(1) + "%") : "—") + "</td>" +
          '<td class="num">' + (r.fit != null ? mark(r.fit, bF, r.fit.toFixed(0) + " cm") : "—") + "</td>" +
          '<td class="num">' + (r.photo != null ? mark(r.photo, bP, Math.round(r.photo * 100) + "%") : "—") + "</td>" +
          '<td class="num">' + (r.tested ? r.pass + " / " + r.tested : '<span class="muted small">no collision</span>') + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="muted small">Medians over every run of a route; routes ran on different labs (R2 and R4 need several pictures or a video), so compare within a lab below as well. Bold is the best route on that measure.</p>';
  }
  var viewer = null, viewerLab = null;
  function labView(lid) {
    var box = document.getElementById("r2slab"); if (!box) return;
    if (viewer) { viewer.dispose(); viewer = null; }
    var l = byLab[lid]; viewerLab = lid;
    document.querySelectorAll("#r2spick [data-lab]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lab") === lid)); });
    var ks = labKeys(lid), w3 = ks.filter(function (k) { return T.results[k].w3d; });
    var gal = (l.gal && l.gal.length) ? l.gal : (l.thumb ? [[l.thumb, "", "", l.cite, l.lic]] : []);
    box.innerHTML = '<div class="r2spart"><h4>Original material <span class="muted small">' + gal.length + " " + (l.type === "video" ? "keyframes" : "pictures") + " · " + esc(TYPE[l.type] || l.type) + "</span></h4>" +
      '<p class="small">' + esc(l.title) + ' <span class="muted">· ' + esc(l.inst) + "</span> · " + esc(l.cite) + (l.url ? ' · <a href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">source</a>' : "") + " " + licChip(l) + "</p>" +
      (gal.length ? '<div class="r2sgal">' + gal.map(function (g, i) { return '<a href="' + esc(g[0]) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(g[0]) + '" alt="' + esc(g[1] || "Source picture " + (i + 1)) + '"><span>' + esc("Photo " + (i + 1) + (g[3] ? " · " + g[3] : "") + (g[4] ? " · " + g[4] : "")) + "</span></a>"; }).join("") + "</div>" : "") + "</div>" +
      '<div class="r2spart"><h4>Scorecard <span class="muted small">one row per run on this lab</span></h4>' + scorecard(ks) + "</div>" +
      (l.cmp ? '<p class="small"><a href="' + esc(l.cmp) + '" target="_blank" rel="noopener">Open the real2sim agent\'s comparison sheet for this lab</a> <span class="muted">(every route side by side in one picture)</span></p>' : "") +
      '<div class="r2spart"><h4>Time per route <span class="muted small">build time first, then the shared Isaac Sim check</span></h4>' + timeChart(ks) + "</div>" +
      '<div class="r2spart"><h4>Results in 3D <span class="muted small">drag to orbit · scroll to zoom · "Photo N" jumps to that picture\'s viewpoint</span></h4>' +
      (w3.length ? '<div class="r2svbar"><select id="r2srun" aria-label="Run">' + w3.map(function (k) { var p = k.split("|"); return '<option value="' + esc(k) + '">' + esc(p[1] + " · " + p[2]) + "</option>"; }).join("") + '</select><span class="r2sviews" id="r2sviews" role="group" aria-label="Viewpoint"></span></div>' +
        '<div class="r2sstage" id="r2sstage"><p class="r2smsg" id="r2smsg">Loading the 3D viewer…</p><p class="r2shud small" id="r2shud"></p></div>' : '<p class="muted small">No 3D files for this lab yet.</p>') + "</div>" +
      '<div class="r2spart"><h4>Every run on this lab <span class="muted small">' + ks.length + "</span></h4>" + (ks.length ? ks.map(resultCard).join("") : '<p class="muted">No run on this lab has finished yet.</p>') + "</div>";
    if (!w3.length) return;
    var first = w3.filter(function (k) { return k.split("|")[1] === "R2"; })[0] || w3[0];
    var sel = document.getElementById("r2srun"); sel.value = first;
    sel.addEventListener("change", function () { show3d(sel.value, false); });
    import(new URL("assets/r2s_viewer.js" + (window.OL_BUILD ? "?v=" + window.OL_BUILD : ""), document.baseURI).href).then(function (mod) {
      if (viewerLab !== lid) return;
      viewer = mod.mount(document.getElementById("r2sstage"), { views: document.getElementById("r2sviews"), msg: document.getElementById("r2smsg"), hud: document.getElementById("r2shud") });
      show3d(sel.value, false);
    }, function (e) { var m = document.getElementById("r2smsg"); if (m) m.textContent = "The 3D viewer could not start in this browser (" + ((e && e.message) || e) + ")."; });
  }
  function show3d(k, scroll) {
    var p = k.split("|"); if (p[0] !== viewerLab) { labView(p[0]); }
    var sel = document.getElementById("r2srun"); if (sel) sel.value = k;
    document.querySelectorAll(".r2sres").forEach(function (c) { c.classList.toggle("on", c.id === "res-" + k.replace(/\|/g, "-")); });
    if (viewer && T.results[k] && T.results[k].w3d) {
      var sc = score(k), note = sc.excl ? "registration failed, excluded from the comparison" : sc.hpsnr != null ? sc.hpsnr.toFixed(1) + " dB on held-out views" : sc.psnr != null ? "short training run, " + sc.psnr.toFixed(1) + " dB on training views" : "";
      viewer.open({ label: p[1] + " " + p[2], w3d: T.results[k].w3d, note: note });
    }
    if (scroll) { var st = document.getElementById("r2sstage"); if (st) st.scrollIntoView({ block: "center", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  }
  function m0Block() {
    var M = (T.m0 || []).slice().sort(function (a, b) { return a.route < b.route ? -1 : a.route > b.route ? 1 : TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier); });
    if (!M.length) return "";
    var gt = M[0].gt, pct = function (v) { return v == null ? "—" : Math.abs(v).toFixed(0) + "%"; };
    var bE = bestOf(M, function (r) { return r.err[3]; }, true), bN = bestOf(M, function (r) { return r.vis && r.vis.bench[1] ? r.vis.bench[0] : r.benches[0]; }, false), bV = bestOf(M, function (r) { return r.vis ? r.vis.err[3] : null; }, true), bH = bestOf(M, function (r) { return r.bench_h_cm; }, true),
      bP = bestOf(M, function (r) { return r.bench_pos_m; }, true), bA = bestOf(M, function (r) { return r.ate; }, true), bB = bestOf(M, function (r) { return r.tm ? r.tm.wall - (r.tm.st.isaac_eval || 0) : null; }, true);
    return '<h3 class="r2sh" id="r2s-exact">The exact-answer check: a room whose true layout is known</h3>' +
      '<p class="small">Step 1 rendered a 54-second walkthrough video of one of your approved rooms in Isaac Sim, so the true answer is known: <b class="num">' + gt.map(function (x) { return x == null ? "?" : x.toFixed(1); }).join(" × ") + " m</b> with <b>" + esc(M[0].benches[1]) + " benches</b>. Each route rebuilt the room from that video alone. " +
      (M.every(function (r) { return r.rev; }) ? '<span class="opst" style="--c:#1f9d55">reviewed by the real2sim agent</span>' : '<span class="opst" style="--c:#f08c00">first results</span> <span class="muted">from the real2sim agent\'s round 2, not yet reviewed by it.</span>') + "</p>" +
      (T.m0_cov ? '<p class="small">What the video shows: <b>' + esc(Math.round(T.m0_cov.floor_pct)) + "% of the floor</b> (" + esc(T.m0_cov.floor_m2) + " of " + esc(T.m0_cov.room_m2) + " m², spanning nearly the full length and width), <b>" + esc(Math.round(T.m0_cov.walls_pct)) + "% of the walls</b> and <b>" + esc(T.m0_cov.benches[0]) + " of the " + esc(T.m0_cov.benches[1]) + " benches</b>. So the misses below come from the methods, not from what the camera saw." +
        (T.m0_cov.cmp ? ' <a href="' + esc(T.m0_cov.cmp) + '" target="_blank" rel="noopener">Open the agent\'s comparison sheet</a>' : "") + "</p>" : "") +
      '<div class="tscroll"><table class="cmp r2sscore"><thead><tr><th>Run</th><th>Room it found</th><th title="Error of the long side, short side and height against the true room">Error long / short / height</th><th title="Mean size error against the part of the room the video actually shows">Error vs what the video saw</th><th title="Benches found among those visible in the video">Visible benches found</th><th title="Median error of the bench-top height">Bench height error</th><th title="Median distance between found and true bench centres">Bench position error</th><th title="Camera path error after alignment (RMSE)">Camera path error</th><th>Build time</th></tr></thead><tbody>' +
      M.map(function (r) {
        var bt = r.tm ? r.tm.wall - (r.tm.st.isaac_eval || 0) : null;
        return '<tr><td><span class="r2sdot" style="background:var(' + (RCOL[r.route] || "--muted") + ')"></span>' + esc(r.route) + " " + esc(r.tier) + "</td>" +
          '<td class="num">' + (r.pred[0] != null ? r.pred.map(function (x) { return x.toFixed(1); }).join(" × ") + " m" : "—") + "</td>" +
          '<td class="num">' + mark(r.err[3], bE, pct(r.err[0]) + " / " + pct(r.err[1]) + " / " + pct(r.err[2])) + "</td>" +
          '<td class="num">' + (r.vis && r.vis.err[3] != null ? mark(r.vis.err[3], bV, r.vis.err[3].toFixed(0) + "%") : "—") + "</td>" +
          '<td class="num">' + (r.vis && r.vis.bench[1] ? mark(r.vis.bench[0], bN, esc(r.vis.bench[0]) + " / " + esc(r.vis.bench[1])) : mark(r.benches[0], bN, esc(r.benches[0]) + " / " + esc(r.benches[1]))) + "</td>" +
          '<td class="num">' + (r.bench_h_cm != null ? mark(r.bench_h_cm, bH, r.bench_h_cm.toFixed(1) + " cm") : "—") + "</td>" +
          '<td class="num">' + (r.bench_pos_m != null ? mark(r.bench_pos_m, bP, r.bench_pos_m.toFixed(2) + " m") : "—") + "</td>" +
          '<td class="num">' + (r.ate != null ? mark(r.ate, bA, r.ate.toFixed(2) + " m") : '<span class="opst" style="--c:#d6336c" title="' + esc(r.ate_fail) + '">failed</span>') + "</td>" +
          '<td class="num">' + (bt != null ? mark(bt, bB, dur(bt)) : "—") + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<p class="muted small">Bold is the best run on each measure; the error column is bold for the lowest mean error over the three sides. What this shows so far: every run misses the 16 m long side by a third or more (R2 medium and full make the room far too big), and at most 3 of the 11 benches are found; heights are close. The real-lab scale numbers below are estimates from reference objects, so this check is the one that decides.</p>' +
      '<div class="shoot">' + M.map(function (r) { var im = r.ims.filter(function (x) { return x[2] === "render_same_view"; })[0] || r.ims[0]; return im ? '<a href="' + esc(im[0]) + '" target="_blank" rel="noopener"><img loading="lazy" src="' + esc(im[0]) + '" alt="' + esc(r.route + " " + r.tier) + '"><span>' + esc(r.route + " " + r.tier) + ": source frame vs rebuilt room</span></a>" : ""; }).join("") + "</div>";
  }
  html += m0Block();
  if (keys.length) html += '<h3 class="r2sh" id="r2s-routes">Which route is better: all labs at a glance</h3>' + routeSummary();
  html += '<h3 class="r2sh" id="r2s-compare">Numbers lab by lab</h3>' + (keys.length ?
    '<div class="r2spick" id="r2spick" role="group" aria-label="Lab">' + T.labs.map(function (l) { return '<button type="button" data-lab="' + esc(l.id) + '" aria-pressed="false">' + esc(short(l)) + ' <span class="muted small">' + esc(TYPE[l.type] || l.type) + "</span></button>"; }).join("") + "</div>" +
    '<div id="r2slab" class="r2slabview"></div>' : '<p class="muted">No run has finished yet. The first are the fast route (R1) on one video lab and one paper lab.</p>');
  html += '<details class="small"><summary>The routes</summary><ul>' + T.routes.map(function (r) { return "<li><b>" + esc(r.id) + " " + esc(r.name) + "</b> — " + esc(r.method) + ' <span class="muted">(inputs: ' + esc(r.inputs.join(", ")) + "; tiers: " + esc(r.tiers.join(", ")) + ")</span></li>"; }).join("") + "</ul>" +
    "<p><b>Shared post-processing:</b> " + esc(T.post) + "</p><p><b>Privacy:</b> " + esc(T.privacy) + "</p></details>";
  el.innerHTML = html;
  if (!keys.length) return;
  el.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lab]"); if (b && b.closest("#r2spick")) { labView(b.getAttribute("data-lab")); return; }
    var v = e.target.closest("[data-r2s3d]"); if (v) { show3d(v.getAttribute("data-r2s3d"), true); return; }
    var a = e.target.closest('a[href^="#res-"]');
    if (a) {
      var k = keys.filter(function (x) { return "#res-" + x.replace(/\|/g, "-") === a.getAttribute("href"); })[0];
      if (k) { e.preventDefault(); if (k.split("|")[0] !== viewerLab) labView(k.split("|")[0]); var t = document.getElementById("res-" + k.replace(/\|/g, "-")); if (t) t.scrollIntoView({ block: "start" }); }
    }
  });
  var start = (T.labs.filter(function (l) { return labKeys(l.id).length; })[0] || T.labs[0]).id;
  var holder = el.closest("details");
  if (holder && !holder.open) holder.addEventListener("toggle", function once() { if (holder.open) { holder.removeEventListener("toggle", once); labView(start); } });
  else labView(start);
})();
