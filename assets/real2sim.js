/* real2sim.html — renders the real2sim research catalogue (window.REAL2SIM). */
(function () {
  "use strict";
  var R = window.REAL2SIM, S = window.STATUS, OL = window.OL, esc = OL.esc;
  var $ = function (sel) { return document.querySelector(sel); };
  OL.initTheme($("#themeBtn"));
  if (!R) { $("#updated").textContent = "Research data failed to load."; return; }
  $("#updated").textContent = "Real2sim options · research of " + String(R.updated_at || "").slice(0, 10);

  var steps = S && S.pipeline ? S.pipeline.steps : [];
  $("#tabs").innerHTML = '<a class="tab" href="agents.html">Plan &amp; progress</a>' + steps.map(function (s) {
    return '<a class="tab ' + esc(s.id) + '" href="index.html#' + esc(s.groups[0]) + '"><span class="badge" aria-hidden="true">' + esc(s.n) + "</span>" + esc(s.title) + "</a>";
  }).join("") + '<a class="tab" href="catalog.html">Assets &amp; scenes</a><a class="tab" aria-selected="true" href="real2sim.html">Real2sim</a><a class="tab" href="index.html#summary">Goals &amp; timeline</a>';

  var EV = { verified_usable: ["Verified", "ev-v"], paper_claimed: ["Paper claim", "ev-p"], vendor_claimed: ["Vendor claim", "ev-d"], unverified: ["Unverified", "ev-u"] };
  function ev(level) { var e = EV[level]; return e ? '<span class="ev ' + e[1] + '">' + e[0] + "</span>" : ""; }
  function score(v) {
    if (typeof v !== "number") return esc(v == null ? "—" : v);
    return '<span class="sc"><span class="scb"><i style="width:' + Math.max(0, Math.min(100, v / 5 * 100)).toFixed(0) + '%"></i></span><b>' + v.toFixed(1) + "</b></span>";
  }
  function list(xs) { return xs && xs.length ? "<ul>" + xs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : ""; }
  var SOL = {}; (R.solutions || []).forEach(function (s) { SOL[s.id] = s; });
  function solChip(id) { var s = SOL[id]; return '<a class="chip link" href="#' + esc(id) + '">' + esc(id) + (s ? " · " + esc(s.short_name_zh) : "") + "</a>"; }

  var counts = {}; (R.sources || []).forEach(function (s) { counts[s.evidence_level] = (counts[s.evidence_level] || 0) + 1; });
  $("#r2s-note").textContent = (R.solutions || []).length + " approaches, " + (R.landscape_directions || []).length + " technology areas, " + (R.sources || []).length +
    " sources (" + Object.keys(counts).map(function (k) { return counts[k] + " " + (EV[k] ? EV[k][0].toLowerCase() : k); }).join(", ") + ").";

  /* recommended first pilot */
  var RG = R.recommendations_by_goal || {}, P = RG.recommended_first_pilot;
  if (P) $("#pilot").innerHTML = '<div class="pilotbox"><span class="eyebrow">Recommended first pilot</span><h2>' + esc(P.choice) + "</h2><p>" + esc(P.why_zh) + "</p></div>";

  /* goals */
  $("#goals").innerHTML = ["fastest_to_result", "highest_fidelity", "lowest_cost", "best_for_large_scale"].filter(function (k) { return RG[k]; }).map(function (k) {
    var g = RG[k];
    return '<article class="goalcard"><h3>' + esc(g.goal_zh) + '</h3><div class="chips">' + (g.primary_solutions || []).map(solChip).join("") + "</div><p>" + esc(g.combination_advice_zh) + "</p>" +
      (g.caveat_zh ? '<p class="muted small">注意：' + esc(g.caveat_zh) + "</p>" : "") + "</article>";
  }).join("");

  /* comparison table */
  var CM = R.comparison_matrix || { dimensions: [], rows: [] };
  $("#cmp").innerHTML = "<thead><tr>" + CM.dimensions.map(function (d) { return "<th>" + esc(d.label_zh) + "</th>"; }).join("") + "</tr></thead><tbody>" +
    CM.rows.map(function (r) {
      return "<tr>" + CM.dimensions.map(function (d, i) {
        var v = r[d.key];
        if (i === 0) return '<th scope="row"><a href="#' + esc(r.id) + '">' + esc(r.id) + " · " + esc(v) + "</a></th>";
        if (/score|fit/.test(d.key)) return "<td>" + score(v) + "</td>";
        if (d.key === "trl") return '<td class="num">' + esc(v) + "</td>";
        return "<td>" + esc(v) + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody>";

  /* solutions */
  $("#sols").innerHTML = (R.solutions || []).map(function (s) {
    var m = s.metrics || {}, t = s.time_and_labor_per_room || {}, h = s.hardware_and_compute || {}, mat = s.maturity || {}, fit = s.ominilab_fit || {}, rk = s.risks || {};
    var metricRows = Object.keys(m).map(function (k) {
      var x = m[k]; var label = { geometry_accuracy: "Geometry", appearance_fidelity: "Appearance", physical_usability: "Physics", articulation_handling: "Moving parts" }[k] || k;
      return '<div class="mrow2"><span class="ml">' + esc(label) + "</span>" + score(x.score) + '<span class="md">' + esc(x.detail) + " " + ev(x.evidence_level) + "</span></div>";
    }).join("");
    var chem = rk.chem_lab_specific || {};
    var chemRows = Object.keys(chem).map(function (k) {
      var label = { transparent_glass: "Transparent glass", reflective_stainless: "Reflective steel", tiny_buttons_knobs: "Small buttons and knobs", dense_benchtop: "Crowded benches" }[k] || k;
      return "<li><b>" + esc(label) + ":</b> " + esc(chem[k]) + "</li>";
    }).join("");
    return '<details class="sol" id="' + esc(s.id) + '"' + (s.recommended_badge === "综合首选 / 规模化主力" ? " open" : "") + '><summary><span class="sid">' + esc(s.id) + '</span><span class="stx"><b>' + esc(s.name_zh) + "</b>" +
      (s.recommended_badge ? '<span class="badge2">' + esc(s.recommended_badge) + "</span>" : "") + '<span class="muted">' + esc(s.one_line_positioning) + "</span></span>" +
      '<span class="sfit">Fit ' + score(fit.score) + "</span></summary>" +
      '<div class="solbody"><div class="soltags"><span class="chip">' + esc(s.category_tag) + '</span><span class="chip">TRL ' + esc(mat.trl) + "</span>" + ev(mat.evidence_level) + "</div>" +
      '<h4>Pipeline</h4><p class="flow">' + esc(s.pipeline_flow_text) + "</p>" +
      '<div class="two"><div><h4>Input</h4><p>' + esc(s.inputs) + "</p></div><div><h4>Output</h4><p>" + esc(s.outputs) + "</p></div></div>" +
      "<h4>Quality</h4>" + metricRows +
      '<div class="two"><div><h4>Pros</h4>' + list(s.pros) + "</div><div><h4>Cons</h4>" + list(s.cons) + "</div></div>" +
      '<h4>Per room</h4><dl class="kv"><dt>On-site capture</dt><dd>' + esc(t.capture_hours) + "</dd><dt>Processing</dt><dd>" + esc(t.processing_and_modeling_days) +
      "</dd><dt>People</dt><dd>" + esc(t.human_effort_person_days) + "</dd><dt>Cost</dt><dd>" + esc(t.marginal_cost_cny) + "</dd></dl>" +
      "<h4>Hardware</h4><p>" + esc(h.field_hardware) + (h.vram_requirement_gb ? " · GPU memory ≥ " + esc(h.vram_requirement_gb) + " GB" : "") + "</p>" +
      (chemRows ? "<h4>Chemistry-lab risks</h4><ul>" + chemRows + "</ul>" : "") + (rk.general ? "<h4>Other risks</h4>" + list(rk.general) : "") +
      "<h4>Fit with OminiLab</h4><dl class=\"kv\"><dt>USD</dt><dd>" + esc(fit.usd_compatibility) + "</dd><dt>Scene checks G1–G7</dt><dd>" + esc(fit.g1_g7_readiness) +
      "</dd><dt>Reuse of our 267 assets</dt><dd>" + esc(fit.asset_library_267_reuse) + "</dd><dt>F1 annotation</dt><dd>" + esc(fit.f1_annotation_integration) + "</dd><dt>Mobile robot</dt><dd>" + esc(fit.mobile_base_readiness) + "</dd></dl>" +
      "<h4>Tools</h4><ul class=\"tools\">" + (s.tools_and_repos || []).map(function (x) {
        return "<li>" + (x.url ? '<a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.name) + "</a>" : esc(x.name)) + " — " + esc(x.role) +
          ' <span class="muted">(' + (x.open_source ? "open source" : "closed") + (x.license ? ", " + esc(x.license) : "") + ")</span> " + ev(x.evidence_level) + "</li>";
      }).join("") + "</ul>" +
      '<p class="muted small">Licence: ' + esc(s.licenses_and_commercial_risk) + "</p></div></details>";
  }).join("");

  /* chemistry-lab risk matrix */
  var RM = R.chemical_lab_risk_matrix || [], ids = (R.solutions || []).map(function (s) { return s.id; });
  function lvl(t) { t = String(t || ""); return /极高/.test(t) ? "r5" : /高/.test(t) ? "r4" : /中低/.test(t) ? "r2" : /中/.test(t) ? "r3" : /低/.test(t) ? "r1" : ""; }
  $("#risk").innerHTML = "<thead><tr><th>Challenge</th>" + ids.map(function (i) { return '<th><a href="#' + esc(i) + '">' + esc(i) + "</a></th>"; }).join("") + "<th>Best mitigation</th></tr></thead><tbody>" +
    RM.map(function (c) {
      return '<tr><th scope="row">' + esc(c.name_zh) + '<div class="muted small">' + esc(c.failure_mechanism_zh) + "</div></th>" +
        ids.map(function (i) { var v = (c.solution_ratings || {})[i]; return '<td class="rk ' + lvl(v) + '">' + esc(v || "—") + "</td>"; }).join("") +
        '<td class="small">' + esc(c.best_mitigation_zh) + "</td></tr>";
    }).join("") + "</tbody>";

  /* landscape */
  $("#dirs").innerHTML = (R.landscape_directions || []).map(function (d) {
    return '<article class="dircard"><div class="dirhead"><h3>' + esc(d.name_zh) + '</h3><span class="chip">' + esc(d.maturity_range) + "</span></div><p>" + esc(d.summary_zh) + "</p>" +
      '<ul class="works">' + (d.representative_works || []).map(function (w) {
        return "<li>" + (w.url ? '<a href="' + esc(w.url) + '" target="_blank" rel="noopener">' + esc(w.name) + "</a>" : esc(w.name)) +
          ' <span class="muted small">' + esc(w.date || "") + (w.maturity ? " · " + esc(w.maturity) : "") + (w.open_source === true ? " · open source" : w.open_source === false ? " · closed" : "") + "</span> " + ev(w.evidence_level) + "</li>";
      }).join("") + "</ul></article>";
  }).join("");

  /* sources */
  $("#srcs").innerHTML = (R.sources || []).map(function (s) {
    return "<li>" + (s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.title) + "</a>" : esc(s.title)) + ' <span class="muted small">' + esc(s.date || "") + "</span> " + ev(s.evidence_level) + "</li>";
  }).join("");

  if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el && el.tagName === "DETAILS") { el.open = true; el.scrollIntoView(); } }
  window.addEventListener("hashchange", function () { var el = document.getElementById(location.hash.slice(1)); if (el && el.tagName === "DETAILS") el.open = true; });
})();
