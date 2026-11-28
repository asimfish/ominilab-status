/* Real2sim trials: 3D viewer for one run (room.glb with src_cam_<i> camera nodes, or an R4 scene.splat).
   Loaded on demand from r2s_trials.js; three.js and GaussianSplats3D are self-hosted under assets/vendor (no CDN).
   Files are fetched through sw.js, which decrypts them like every other asset. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { makeRig } from "./viewer3d.js";

/* 11-28 (user): removed objects stay visible as red ghosts, and library instruments can be operated as in the asset
   library. A real2sim room.glb merges each object into one mesh, so an operable instrument is swapped, on demand, for
   the library's articulated preview model (assets/models/<k>.glb + assets/artic/<k>.json, the same files the asset
   library uses), fitted to the merged mesh's box with the inventory yaw, and driven by viewer3d.js's makeRig. */
const GHOST = new THREE.MeshBasicMaterial({ color: 0xff2d20, transparent: true, opacity: 0.38, depthWrite: false });
const libLoader = new GLTFLoader(); libLoader.setMeshoptDecoder(MeshoptDecoder);
function ghostify(obj, on) {
  obj.traverse(o => {
    if (!o.isMesh) return;
    if (on && !o.userData.gOrig) { o.userData.gOrig = o.material; o.material = GHOST; }
    else if (!on && o.userData.gOrig) { o.material = o.userData.gOrig; delete o.userData.gOrig; }
  });
}
function safeBox(obj) {   // world box from meshes whose own bounds are finite (one bad primitive must not poison the fit)
  const out = new THREE.Box3(), b = new THREE.Box3(); obj.updateMatrixWorld(true);
  obj.traverse(o => {
    if (!o.isMesh || !o.geometry) return;
    if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    const g = o.geometry.boundingBox; if (!g || g.isEmpty() || ![g.min.x, g.min.y, g.min.z, g.max.x, g.max.y, g.max.z].every(isFinite)) return;
    b.copy(g).applyMatrix4(o.matrixWorld); out.union(b);
  });
  return out;
}
function centroid(obj) {   // mean of up to ~20k world-space vertices: tells a model from its 180-degree turn
  const c = new THREE.Vector3(), v = new THREE.Vector3(); let n = 0;
  obj.updateMatrixWorld(true);
  obj.traverse(o => {
    const a = o.isMesh && o.geometry && o.geometry.attributes.position; if (!a) return;
    const st = Math.max(1, Math.floor(a.count / 4000));
    for (let i = 0; i < a.count; i += st) { v.fromBufferAttribute(a, i).applyMatrix4(o.matrixWorld); c.add(v); n++; }
  });
  return n ? c.divideScalar(n) : null;
}

const camIndex = (c, i) => { const m = /src_cam_(\d+)/.exec((c && (c.name || (c.parent && c.parent.name))) || ""); return m ? +m[1] : i; };

export function mount(stage, ui) {
  const canvas = document.createElement("canvas");
  stage.prepend(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.03, 500);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.screenSpacePanning = true;
  let content = null, splat = null, splatMid = null, bounds = null, cams = [], token = 0, alive = true;
  // v3 editing (11-27): nodes named by inventory id can be picked and hidden
  const items = new Map(); let picked = null, pickBox = null, cutY = null;
  const ops = new Map(), swaps = new Map(), ghostBoxes = []; let hidden = new Set(), ghostOn = true; const clock = new THREE.Clock();
  // cut-away: clip everything above cutY (ceiling, top of walls) so the room can be seen from above
  function setCut(on) { renderer.clippingPlanes = on && cutY != null ? [new THREE.Plane(new THREE.Vector3(0, -1, 0), cutY)] : []; }
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb8bcc4, 2.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(3, 8, 4); scene.add(sun);

  const bg = () => getComputedStyle(stage).getPropertyValue("--r2s-stage").trim() || getComputedStyle(document.documentElement).getPropertyValue("--surface-2").trim() || "#e2e6ed";
  function resize() { const w = canvas.clientWidth || 640, h = canvas.clientHeight || 360; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(resize); ro.observe(stage); resize();
  (function loop() { if (!alive) return; requestAnimationFrame(loop); const dt = Math.min(0.1, clock.getDelta()); swaps.forEach(w => { if (w.rig) w.rig.step(dt); }); controls.update(); scene.background = new THREE.Color(bg()); renderer.render(scene, camera); })();

  function clear() {
    if (content) {
      scene.remove(content);
      content.traverse(o => { if (o.geometry) o.geometry.dispose(); (o.material ? [].concat(o.material) : []).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); });
      content = null;
    }
    if (splat) { scene.remove(splat); try { splat.dispose(); } catch (e) { /* already gone */ } splat = null; }
    swaps.forEach(w => { if (w.g) { scene.remove(w.g); w.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); } }); swaps.clear(); ops.clear();
    ghostBoxes.splice(0).forEach(b => scene.remove(b)); hidden = new Set();
    cams = []; bounds = null; splatMid = null; items.clear(); picked = null; cutY = null; renderer.clippingPlanes = [];
    if (pickBox) { scene.remove(pickBox); pickBox = null; }
  }
  function select(id) {
    if (pickBox) { scene.remove(pickBox); pickBox = null; }
    picked = id && items.has(id) ? id : null;
    if (picked) { const w = swaps.get(picked); pickBox = new THREE.BoxHelper(w && w.g ? w.g : items.get(picked), 0xff6a00); scene.add(pickBox); }
  }
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
  canvas.addEventListener("pointerdown", e => { down = e.button === 0 ? [e.clientX, e.clientY] : null; });
  canvas.addEventListener("pointerup", e => {
    if (!content || !items.size || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    const r = canvas.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObject(content, true).filter(h => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return true; });
    let id = null;
    const hits2 = swaps.size ? ray.intersectObjects(Array.from(swaps.values()).map(w => w.g).filter(g => g && g.visible), true) : [];
    hits.push(...hits2); hits.sort((a, b) => a.distance - b.distance);
    for (const h of hits) { let o = h.object; while (o && !(o.userData.opId || (o.name && items.has(o.name)))) o = o.parent; if (o) { id = o.userData.opId || o.name; break; } }
    select(id);
    if (ui.onPick) ui.onPick(id);
  });
  function view(kind) {
    ui.views.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === kind)));
    if (kind.startsWith("cam")) {
      const c = cams[+kind.slice(3)]; if (!c) return;
      const p = new THREE.Vector3(), q = new THREE.Quaternion(); c.getWorldPosition(p); c.getWorldQuaternion(q);
      camera.position.copy(p); camera.quaternion.copy(q); if (c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix(); }
      controls.target.copy(p).addScaledVector(new THREE.Vector3(0, 0, -1).applyQuaternion(q), 2.5); controls.update(); return;
    }
    camera.fov = 55; camera.updateProjectionMatrix();
    if (kind === "inside") {
      const m = splatMid || new THREE.Vector3(), sz = bounds ? bounds.getSize(new THREE.Vector3()) : new THREE.Vector3(4, 4, 4), d = Math.max(0.05, Math.min(sz.x, sz.z) * 0.08);
      camera.fov = 70; camera.updateProjectionMatrix(); camera.near = Math.max(0.001, d * 0.02); camera.updateProjectionMatrix();
      camera.position.copy(m).add(new THREE.Vector3(0, 0, d)); controls.target.copy(m).add(new THREE.Vector3(0, 0, -d)); controls.update(); return;
    }
    camera.near = 0.03;
    const b = bounds || new THREE.Box3(new THREE.Vector3(-3, 0, -3), new THREE.Vector3(3, 3, 3));
    const c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3()), r = Math.max(s.x, s.z, splat ? 0.01 : 2);
    if (kind === "top") { camera.position.set(c.x, b.max.y + r * 1.25, c.z + 0.001); controls.target.copy(c); }
    else { camera.position.set(c.x + r * 0.75, b.max.y + r * 0.55, c.z + r * 0.95); controls.target.set(c.x, b.min.y + s.y * 0.35, c.z); }
    controls.update();
  }
  function viewButtons() {
    const list = (splat ? [["inside", "室内"]] : []).concat([["orbit", "总览"], ["top", "俯视"]]).concat(cams.map((c, i) => ["cam" + i, "照片 " + (camIndex(c, i) + 1)]));
    ui.views.innerHTML = list.map(([k, t]) => '<button type="button" data-v="' + k + '" aria-pressed="false">' + t + "</button>").join("");
  }
  ui.views.addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) view(b.dataset.v); });
  const say = t => { ui.msg.textContent = t || ""; ui.msg.hidden = !t; };

  async function open(run) {
    const my = ++token; clear(); say("正在加载 " + run.label + "…"); ui.hud.textContent = "";
    const w = run.w3d;
    try {
      if (w.fmt === "splat") {
        const G = await import("./vendor/gsplat/gaussian-splats-3d.module.js");
        if (my !== token) return;
        splat = new G.DropInViewer({ gpuAcceleratedSort: false, sharedMemoryForWorkers: false, dynamicScene: false });
        await splat.addSplatScene(w.p, { showLoadingUI: false, progressiveLoad: false, format: G.SceneFormat.Splat, splatAlphaRemovalThreshold: 5 });
        if (my !== token) { clear(); return; }
        scene.add(splat);
        try {
          const buf = await (await fetch(w.p)).arrayBuffer(), f = new Float32Array(buf), n = Math.floor(buf.byteLength / 32), step = Math.max(1, Math.floor(n / 40000));
          const ax = [[], [], []];
          for (let i = 0; i < n; i += step) for (let j = 0; j < 3; j++) { const v = f[i * 8 + j]; if (isFinite(v)) ax[j].push(v); }
          const q = (a, t) => a[Math.min(a.length - 1, Math.max(0, Math.round(t * (a.length - 1))))];
          ax.forEach(a => a.sort((x, y) => x - y));
          bounds = new THREE.Box3(new THREE.Vector3(q(ax[0], .05), q(ax[1], .05), q(ax[2], .05)), new THREE.Vector3(q(ax[0], .95), q(ax[1], .95), q(ax[2], .95)));
          splatMid = new THREE.Vector3(q(ax[0], .5), q(ax[1], .5), q(ax[2], .5));
        } catch (e) { bounds = new THREE.Box3(new THREE.Vector3(-4, -1.5, -4), new THREE.Vector3(4, 2.5, 4)); splatMid = new THREE.Vector3(); }
        if (my !== token) { clear(); return; }
        viewButtons(); view("inside");
        ui.hud.textContent = "照片级高斯点：只有外观，没有碰撞体" + (run.note ? "；" + run.note : "") + (w.n ? " · " + Math.round(w.n / 1000) + "k 个高斯点" : "") + (w.mb ? " · " + w.mb + " MB" : "");
      } else {
        const gltf = await new GLTFLoader().loadAsync(w.p);
        if (my !== token) return;
        const root = gltf.scene;
        if (!run.lit) root.traverse(o => {
          if (!o.isMesh) return;
          const ms = [].concat(o.material);
          const flat = ms.map(m => new THREE.MeshBasicMaterial({ map: m.map || null, color: m.map ? 0xffffff : (m.color || 0xcccccc), side: THREE.FrontSide, transparent: !!m.transparent, opacity: m.opacity ?? 1 }));
          ms.forEach(m => m.dispose()); o.material = Array.isArray(o.material) ? flat : flat[0];
        });
        scene.add(root); content = root; root.updateMatrixWorld(true);
        if (run.items && run.items.length) { const want = new Set(run.items); root.traverse(o => { if (o.name && want.has(o.name) && !items.has(o.name)) items.set(o.name, o); }); }
        (run.ops || []).forEach(x => { if (items.has(x.id)) ops.set(x.id, x); });
        bounds = new THREE.Box3().setFromObject(root);
        if (run.cut) { cutY = bounds.min.y + run.cut; setCut(true); }
        cams = (gltf.cameras || []).filter(c => /src_cam_/.test(c.name || (c.parent && c.parent.name) || "")).sort((a, b) => camIndex(a, 0) - camIndex(b, 0));
        viewButtons(); view("orbit");
        const s = bounds.getSize(new THREE.Vector3());
        ui.hud.textContent = (run.lit ? "干净材质，有光照" : "烘焙纹理，无光照显示") + (run.cut ? "；顶棚已切开" : "") + " · " + s.x.toFixed(1) + " × " + s.z.toFixed(1) + " × " + s.y.toFixed(1) + " m" + (w.tri ? " · " + Number(w.tri).toLocaleString() + " 个三角面" : "") + (w.mb ? " · " + w.mb + " MB" : "");
      }
      say("");
    } catch (e) {
      if (my === token) say("这个 3D 文件显示失败（" + ((e && e.message) || e) + "）。");
    }
  }
  function photo(p) { const i = cams.findIndex((c, j) => camIndex(c, j) === p); view(i >= 0 ? "cam" + i : "orbit"); }
  // removed objects: red ghosts (with a red box) while ghostOn, otherwise hidden
  function setHidden(ids, ghost) {
    hidden = ids; if (ghost != null) ghostOn = !!ghost;
    ghostBoxes.splice(0).forEach(b => scene.remove(b));
    items.forEach((o, id) => {
      const w = swaps.get(id), obj = w && w.g ? w.g : o, gone = ids.has(id);
      if (w && w.g) o.visible = false;
      ghostify(obj, gone && ghostOn);
      obj.visible = !gone || ghostOn;
      if (gone && ghostOn) { const b = new THREE.BoxHelper(obj, 0xff2d20); ghostBoxes.push(b); scene.add(b); }
    });
    if (picked && ids.has(picked) && !ghostOn) select(null);
  }
  // swap one operable instrument for its articulated library model (once), fitted to the merged mesh
  async function ensureOp(id) {
    const x = ops.get(id), orig = items.get(id); if (!x || !orig) return null;
    let w = swaps.get(id); if (w) return w.ready;
    w = { g: null, rig: null, fit: null }; swaps.set(id, w);
    w.ready = (async () => {
      const [gltf, ar] = await Promise.all([libLoader.loadAsync(x.glb || "assets/models/" + x.k + ".glb"), fetch(x.art || "assets/artic/" + x.k + ".json").then(r => r.json())]);
      if (!alive || swaps.get(id) !== w) return null;
      const sc = gltf.scene, g = new THREE.Group(); g.add(sc);
      const box = new THREE.Group(); box.userData.opId = id; box.add(g);   // what replaces the merged mesh: model (+ base block)
      orig.updateMatrixWorld(true);
      const tb = new THREE.Box3().setFromObject(orig), ob = tb.clone();
      const lbx = safeBox(sc); if (lbx.isEmpty()) throw new Error("资产库预览模型没有可用的几何");
      const lb = lbx.getSize(new THREE.Vector3());
      if (![lb.x, lb.y, lb.z].every(v => isFinite(v) && v > 1e-4)) throw new Error("资产库预览模型的尺寸读不出来，保留房间里原来的模型");
      // orientation from the footprint: the inventory yaw is only a prior (some builders turn assets by a quarter). Try
      // the four quarter turns; prefer the one that needs no stretching, then the one whose vertex centroid matches
      const yaw = (+x.yaw || 0), c0 = centroid(orig), sn = v => (Math.abs(v - 1) < 0.04 ? 1 : v);
      let ts = tb.getSize(new THREE.Vector3()), tc = tb.getCenter(new THREE.Vector3());
      const diag = Math.max(0.1, ts.length());
      const fitFor = turn => {
        const yy = yaw + turn, q = ((Math.round(yy / 90) % 4) + 4) % 4, right = Math.abs(yy - Math.round(yy / 90) * 90) < 1;
        let sx, sz;
        if (right) { sx = sn((q % 2 ? ts.z : ts.x) / Math.max(lb.x, 1e-6)); sz = sn((q % 2 ? ts.x : ts.z) / Math.max(lb.z, 1e-6)); }
        else { sx = sz = sn(Math.sqrt((ts.x * ts.z) / Math.max(lb.x * lb.z, 1e-9))); }
        const okH = [sx, sz].every(v => v > 0.6 && v < 1.6);
        return { turn, sx, sz, sy: 1, okH, dev: Math.abs(Math.log(sx)) + Math.abs(Math.log(sz)) + (okH ? 0 : 5) };
      };
      const place = f => {
        g.rotation.set(0, (yaw + f.turn) * Math.PI / 180, 0); g.scale.set(f.sx, f.sy, f.sz); g.position.set(0, 0, 0); g.updateMatrixWorld(true);
        const mb = safeBox(g), mc = mb.getCenter(new THREE.Vector3());
        g.position.set(tc.x - mc.x, tb.min.y - mb.min.y, tc.z - mc.z); g.updateMatrixWorld(true);
      };
      let best = null;
      for (const turn of [0, 90, 180, 270]) {
        const f = fitFor(turn); f.sy = sn(ts.y / Math.max(lb.y, 1e-6)); place(f);
        const cg = c0 ? centroid(g) : null; f.dc = c0 && cg ? cg.distanceTo(c0) : 0; if (!isFinite(f.dc)) f.dc = 9;
        f.score = f.dev * 3 + f.dc / diag;
        if (!best || f.score < best.score - 1e-4) best = f;
      }
      // height: a hood on its own base cabinet is merged with that base (inventory base_h, or inferred when the merged
      // mesh is clearly taller than the model while the footprint matches); fit the model above it and add a base block
      let bh = +x.bh || 0, baseSrc = bh ? "inventory" : "";
      if (!bh && best.okH && best.dev < 0.2 && ts.y / Math.max(lb.y, 1e-6) > 1.15 && ts.y - lb.y > 0.1) { bh = ts.y - lb.y * Math.sqrt(best.sx * best.sz); baseSrc = "inferred"; }
      const hasBase = bh > 0.05 && bh < ts.y * 0.8;
      if (hasBase) { tb.min.y += bh; ts = tb.getSize(new THREE.Vector3()); tc = tb.getCenter(new THREE.Vector3()); }
      if (best.okH) { const sy = sn(ts.y / Math.max(lb.y, 1e-6)); best.sy = sy > 0.6 && sy < 1.6 ? sy : 1; }
      else { const u = Math.min(2.5, Math.max(0.4, ts.y / Math.max(lb.y, 1e-6))); best.sx = best.sy = best.sz = u; }   // nothing fits: uniform by height
      place(best);
      const r3 = v => +v.toFixed(3);
      w.fit = { scale: [r3(best.sx), r3(best.sy), r3(best.sz)], scaled: best.okH, turn: best.turn, centroid_m: r3(best.dc), bottomY: r3(ob.min.y),
                base_m: hasBase ? r3(bh) : 0, base_src: hasBase ? baseSrc : "", room_box: [r3(ob.max.x - ob.min.x), r3(ob.max.y - ob.min.y), r3(ob.max.z - ob.min.z)], model_box: [r3(lb.x), r3(lb.y), r3(lb.z)] };
      if (hasBase) {
        const bs = ob.getSize(new THREE.Vector3()), rgb = x.brgb || [0.62, 0.62, 0.6];
        const base = new THREE.Mesh(new THREE.BoxGeometry(bs.x, bh, bs.z), new THREE.MeshStandardMaterial({ color: new THREE.Color(rgb[0], rgb[1], rgb[2]), roughness: 0.8 }));
        base.position.set(tc.x, ob.min.y + bh / 2, tc.z); box.add(base);
      }
      scene.add(box); w.g = box; orig.visible = false;
      w.rig = makeRig(ar); w.rig.attach(sc, false); w.ar = ar;
      setHidden(hidden);
      if (picked === id) select(id);
      return w;
    })().catch(e => { swaps.delete(id); throw e; });
    return w.ready;
  }
  async function operate(id, which, on) { const w = await ensureOp(id); if (w && w.rig) w.rig.set(which, on ? 1 : 0); return w; }
  async function highlightJoint(id, i) { const w = swaps.get(id); if (w && w.rig && w.g && !hidden.has(id)) return w.rig.highlight(i); return 0; }
  function focus(id) {
    const w = swaps.get(id), obj = w && w.g ? w.g : items.get(id); if (!obj) return;
    const b = new THREE.Box3().setFromObject(obj), c = b.getCenter(new THREE.Vector3()), r = Math.max(0.6, b.getSize(new THREE.Vector3()).length());
    const dir = camera.position.clone().sub(controls.target); if (dir.lengthSq() < 1e-6) dir.set(1, 0.7, 1);
    dir.normalize(); if (dir.y < 0.25) { dir.y = 0.35; dir.normalize(); }
    controls.target.copy(c); camera.position.copy(c).addScaledVector(dir, r * 1.4); camera.near = 0.02; camera.updateProjectionMatrix(); controls.update();
  }
  function opFits() { const out = {}; swaps.forEach((w, id) => { if (w.fit) out[id] = w.fit; }); return out; }
  const api = { open, photo, setHidden, select, setCut, ensureOp, operate, highlightJoint, focus, opFits, isOperable: id => ops.has(id), pickable: () => items.size, dispose() { alive = false; clear(); ro.disconnect(); renderer.dispose(); canvas.remove(); } };
  api.snap = () => { renderer.render(scene, camera); return renderer.domElement.toDataURL("image/jpeg", 0.85); };   // one frame as an image (headless checks)
  stage.__r2sViewer = api;   // for the headless browser checks
  return api;
}

/* Still pictures of several runs from one source photo's camera, for the "same view, every route" grid.
   One hidden renderer is shared; loaded rooms are cached until dropSnapshots() is called. */
let snapR = null;
const snapCache = new Map();
async function snapEntry(url, lit) {
  const key = url + (lit ? "#lit" : "");
  if (snapCache.has(key)) return snapCache.get(key);
  const p = new GLTFLoader().loadAsync(url).then(gltf => {
    const root = gltf.scene;
    if (!lit) root.traverse(o => {
      if (!o.isMesh) return;
      const ms = [].concat(o.material);
      const flat = ms.map(m => new THREE.MeshBasicMaterial({ map: m.map || null, color: m.map ? 0xffffff : (m.color || 0xcccccc), side: THREE.FrontSide }));
      ms.forEach(m => m.dispose()); o.material = Array.isArray(o.material) ? flat : flat[0];
    });
    root.updateMatrixWorld(true);
    return { root, cams: (gltf.cameras || []).filter(c => /src_cam_/.test(c.name || (c.parent && c.parent.name) || "")) };
  });
  snapCache.set(key, p);
  return p;
}
export async function snapshot(url, camIdx, w, h, bg, lit) {
  if (!snapR) { snapR = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); snapR.outputColorSpace = THREE.SRGBColorSpace; }
  const e = await snapEntry(url, lit);
  const c = e.cams.find((x, i) => camIndex(x, i) === camIdx);
  if (!c) return null;
  snapR.setSize(w, h, false);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(bg || "#e2e6ed"); scene.add(e.root);
  if (lit) { scene.add(new THREE.HemisphereLight(0xffffff, 0xb8bcc4, 2.6)); const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(3, 8, 4); scene.add(sun); }
  const cam = new THREE.PerspectiveCamera(c.fov || 60, w / h, 0.03, 500);
  const p = new THREE.Vector3(), q = new THREE.Quaternion(); c.getWorldPosition(p); c.getWorldQuaternion(q);
  cam.position.copy(p); cam.quaternion.copy(q); cam.updateMatrixWorld(true);
  snapR.render(scene, cam);
  const url2 = snapR.domElement.toDataURL("image/jpeg", 0.86);
  scene.remove(e.root);
  return url2;
}
export async function photoCams(url) { const e = await snapEntry(url); return e.cams.map((c, i) => camIndex(c, i)); }
export function dropSnapshots() {
  snapCache.forEach(p => p.then(e => e.root.traverse(o => { if (o.geometry) o.geometry.dispose(); (o.material ? [].concat(o.material) : []).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); })).catch(() => {}));
  snapCache.clear();
}
