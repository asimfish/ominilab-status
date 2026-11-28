/* 3D preview of one asset (lightweight GLB). Loaded on demand from catalog.js; three.js is self-hosted (no CDN). */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

// Moving-part markers. jm rows: [name, "r"|"p", position, axis, status]; positions are in the preview-GLB frame.
// Hinges (r) are rings around the axis; slides (p) are double arrows along it. Colour = F1 physics test.
const JCOL = { formal: 0x0b5d2e, open: 0x1f9d55, partly: 0xf08c00, none: 0xd6336c, untested: 0x8a94a6 };
export function jointMarkers(jm, size) {
  const g = new THREE.Group(); g.userData.isJoints = true;
  const s = Math.max(size, 0.05);
  (jm || []).forEach(function (j) {
    const mat = new THREE.MeshBasicMaterial({ color: JCOL[j[4]] || JCOL.untested, depthTest: false, transparent: true, opacity: 0.95 });
    const axis = new THREE.Vector3().fromArray(j[3]).normalize(), m = new THREE.Group();
    if (j[1] === "r") {
      m.add(new THREE.Mesh(new THREE.TorusGeometry(s * 0.07, s * 0.008, 8, 32), mat));
      const line = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.004, s * 0.004, s * 0.3, 6), mat); line.rotation.x = Math.PI / 2; m.add(line);
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
    } else {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(s * 0.006, s * 0.006, s * 0.18, 6), mat); m.add(shaft);
      [1, -1].forEach(function (d) { const c = new THREE.Mesh(new THREE.ConeGeometry(s * 0.02, s * 0.05, 10), mat); c.position.y = d * s * 0.11; if (d < 0) c.rotation.z = Math.PI; m.add(c); });
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
    }
    m.position.fromArray(j[2]); m.renderOrder = 10; m.traverse(function (o) { o.renderOrder = 10; });
    g.add(m);
  });
  return g;
}

// Collision display in the style of Isaac Sim's physics debug view: no translucent films. Each collision mesh gets an
// opaque, flat-shaded solid in its type colour and crisp edges. "Model + collision" shows the real model with bright
// green collision outlines; "Collision only" shows the solids with dark edges.
const COL_KIND = { convexHull: 0x4a90e2, convexDecomposition: 0x2bb673, mesh: 0xf39c33, none: 0xf39c33, meshSimplification: 0xf39c33,
  sdf: 0xa66bd6, boundingCube: 0xe0c341, boundingSphere: 0xe0c341, primitive: 0xe6a1b5, shape: 0xe6a1b5 };
const EDGE_BRIGHT = new THREE.LineBasicMaterial({ color: 0x18e05f }), EDGE_DARK = new THREE.LineBasicMaterial({ color: 0x1f2933 });
const solidMats = {};
function solidMat(k) {
  if (!solidMats[k]) solidMats[k] = new THREE.MeshStandardMaterial({ color: COL_KIND[k] || 0x9aa3b1, flatShading: true, roughness: 0.75, metalness: 0,
    side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  return solidMats[k];
}
function kindOf(o) {
  let p = o;
  while (p) {
    if (p.userData && p.userData.kind) return p.userData.kind;
    const m = /^collision_(\w+)/.exec(p.name || ""); if (m) return m[1];
    p = p.parent;
  }
  return "primitive";
}
// "Colour by part": every rigid body gets its own colour, so a cap that is a separate body from its bottle shows apart.
export const PART_HEX = [0x4e79a7, 0xf28e2b, 0xe15759, 0x76b7b2, 0x59a14f, 0xedc948, 0xb07aa1, 0xff9da7, 0x9c755f, 0x86bcb6, 0x8cd17d, 0xd4a6c8];
const partMats = {};
function partMat(b) {
  const k = b == null || b < 0 ? "n" : String(b % PART_HEX.length);
  if (!partMats[k]) partMats[k] = new THREE.MeshStandardMaterial({ color: k === "n" ? 0x9aa3b1 : PART_HEX[+k], flatShading: true, roughness: 0.75, metalness: 0,
    side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  return partMats[k];
}
function bodyOf(o) {
  let p = o;
  while (p) { const m = /__b(\d+|n)$/.exec(p.name || ""); if (m) return m[1] === "n" ? -1 : +m[1]; p = p.parent; }
  return null;
}
let colourBy = "kind";
export function setColourBy(v) { colourBy = v; }
function colMat(o) { return colourBy === "part" ? partMat(o.userData.body) : solidMat(kindOf(o)); }
function styleCollision(root) {
  const meshes = []; root.traverse(function (o) { if (o.isMesh) meshes.push(o); });
  meshes.forEach(function (o) {
    o.userData.body = bodyOf(o);
    o.material = colMat(o);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 25), EDGE_DARK); e.userData.isEdge = true; o.add(e);
  });
  root.userData.colMeshes = meshes;
  return root;
}
function setCollisionLook(root, look) {   // look: "solid" | "outline"
  (root.userData.colMeshes || []).forEach(function (o) {
    o.material = look === "outline" ? HIDDEN : colMat(o);
    o.children.forEach(function (c) { if (c.userData.isEdge) c.material = look === "outline" ? EDGE_BRIGHT : EDGE_DARK; });
  });
}
const HIDDEN = new THREE.MeshBasicMaterial({ visible: false });
const NAME_HL = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6a00, emissiveIntensity: 0.5, roughness: 0.5, flatShading: true });
function offsetModel(root) {   // push the real model back a hair so collision outlines on the same surface stay visible
  root.traverse(function (o) { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.polygonOffset = true; m.polygonOffsetFactor = 2; m.polygonOffsetUnits = 2; }); });
}

// Glass: the exported "Clear" materials are light blue at ~42% opacity, which reads as milky white. Replace them with
// a clear, glossy physical material (clear coat + environment reflections, low opacity, no depth write). No
// transmission pass, so rooms with many vessels stay fast.
const glassMats = new Map();
function isGlass(m) {
  return !!m && (/clear|glass|quartz|cuvette|transparent/i.test(m.name || "") || (m.transparent && m.opacity < 0.75 && (m.roughness == null || m.roughness < 0.3)));
}
export function glassify(root) {
  root.traverse(function (o) {
    if (!o.isMesh || !o.material) return;
    const conv = function (m) {
      if (!isGlass(m)) return m;
      if (!glassMats.has(m.uuid)) {
        const c = m.color ? m.color.clone() : new THREE.Color(0xddeeff);
        const tinted = c.r + c.g + c.b < 1.6;                                    // brown or amber glass keeps its colour
        const g = new THREE.MeshPhysicalMaterial({ color: tinted ? c : c.lerp(new THREE.Color(0xeef6ff), 0.6), metalness: 0, roughness: 0.04,
          transparent: true, opacity: tinted ? 0.55 : 0.16, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.6, specularIntensity: 1,
          side: THREE.DoubleSide, depthWrite: false, flatShading: !!m.flatShading });
        g.name = (m.name || "") + "_glass"; glassMats.set(m.uuid, g);
      }
      return glassMats.get(m.uuid);
    };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
    if ((Array.isArray(o.material) ? o.material : [o.material]).some(function (m) { return m.transparent; })) o.renderOrder = 2;
  });
  return root;
}

// all published models are meshopt-compressed (gltfpack -cc), so every loader needs the decoder
function newLoader() { const l = new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder); return l; }

/* Opening moving parts for real. ar.joints come from HQ's artic_export.py (asset's own USD): pivot p, axis a, limits lo/hi
   (degrees or metres) in the preview-GLB frame, plus the links and visual meshes on the moving side (a door brings its
   handle along; a latch on an inner door moves with that door). Collision GLBs name each group
   "collision_<kind>__<joint indices>" so the collision bodies open too. */
const NONFUNC = /foot|feet|level|caster|wheel|_height$/i;
function openTarget(j) {
  const lo = j.lo == null ? 0 : j.lo, hi = j.hi == null ? 0 : j.hi;
  if (j.free) return j.type === "revolute" ? 90 : 0;   // knobs that turn without limit: show a quarter turn
  const t = Math.abs(hi) >= Math.abs(lo) ? hi : lo;
  return j.type === "revolute" ? Math.max(-180, Math.min(180, t)) : t;
}
function matchNode(name, j) {
  if (!name) return false;
  const bare = name.replace(/^\d{3}_/, "");
  for (const v of j.vis) if (bare === v || bare.startsWith(v + "_")) return true;
  for (const l of j.links) if (name === l || name.endsWith("__" + l)) return true;
  return false;
}
export function makeRig(ar) {
  const J = (ar && ar.joints) || [], n = J.length;
  const full = J.map(openTarget), val = new Array(n).fill(0), tgt = new Array(n).fill(0);
  const func = J.map(function (j, i) {
    return !j.loop && j.links.length > 0 && !NONFUNC.test(j.name) && (j.type === "revolute" ? Math.abs(full[i]) >= 3 : Math.abs(full[i]) >= 0.004);
  });
  const outerFirst = function (a, b) { return J[b].links.length - J[a].links.length; };
  const parts = [], tmp = new THREE.Matrix4(), M = new THREE.Matrix4(), ax = new THREE.Vector3();
  const byJoint = J.map(function () { return []; });   // meshes moved by each joint (own or inherited), for highlighting
  let hl = null;
  const HL = new THREE.MeshStandardMaterial({ color: 0xff8a00, emissive: 0xff6a00, emissiveIntensity: 0.45, roughness: 0.6, flatShading: true });
  function D(i, v, out) {
    const j = J[i];
    if (j.type === "revolute") {
      out.makeTranslation(j.p[0], j.p[1], j.p[2]);
      out.multiply(tmp.makeRotationAxis(ax.fromArray(j.a).normalize(), v * Math.PI / 180));
      out.multiply(tmp.makeTranslation(-j.p[0], -j.p[1], -j.p[2]));
    } else out.makeTranslation(j.a[0] * v, j.a[1] * v, j.a[2] * v);
    return out;
  }
  function apply() {
    const d = new THREE.Matrix4(), one = new THREE.Matrix4();
    parts.forEach(function (p) {
      d.identity(); p.js.forEach(function (i) { d.multiply(D(i, val[i], one)); });
      M.copy(p.Kinv).multiply(d).multiply(p.K).multiply(p.L0);
      M.decompose(p.o.position, p.o.quaternion, p.o.scale);
    });
  }
  return {
    joints: J, full: full, func: func,
    // root: a loaded model or collision scene whose own frame is the preview-GLB frame
    attach: function (root, isCol) {
      root.updateMatrixWorld(true);
      const Ginv = new THREE.Matrix4().copy(root.matrixWorld).invert(); let k = 0;
      root.traverse(function (o) {
        if (o === root) return;
        let js = [];
        if (isCol) { const m = /__((?:\d+_)*\d+)$/.exec(o.name || ""); if (m) js = m[1].split("_").map(Number).filter(function (i) { return i < n; }); }
        else for (let i = 0; i < n; i++) if (matchNode(o.name, J[i])) js.push(i);
        let p = o.parent; const above = new Set();
        while (p && p !== root) { (p.userData.rigJs || []).forEach(function (i) { above.add(i); }); p = p.parent; }
        o.userData.rigJs = js.concat(Array.from(above));
        js = js.filter(function (i) { return !above.has(i); }).sort(outerFirst);
        if (!js.length) return;
        const K = new THREE.Matrix4().copy(Ginv).multiply(o.parent.matrixWorld);
        parts.push({ o: o, js: js, L0: o.matrix.clone(), K: K, Kinv: K.clone().invert() }); k++;
      });
      root.traverse(function (o) { if (o.isMesh) (o.userData.rigJs || []).forEach(function (i) { if (byJoint[i].indexOf(o) < 0) byJoint[i].push(o); }); });
      apply(); return k;
    },
    // paint the parts one joint moves (null clears), so each button shows what it operates
    highlight: function (i) {
      if (hl != null) byJoint[hl].forEach(function (o) { if (o.userData.hlOrig) { o.material = o.userData.hlOrig; delete o.userData.hlOrig; } });
      hl = i == null || !byJoint[i] ? null : i;
      if (hl != null) byJoint[hl].forEach(function (o) { if (o.material && o.material.visible === false) return; o.userData.hlOrig = o.material; o.material = HL; });
      return hl == null ? 0 : byJoint[hl].length;
    },
    detach: function (root) { for (let i = parts.length - 1; i >= 0; i--) { let p = parts[i].o; while (p && p !== root) p = p.parent; if (p === root) parts.splice(i, 1); } },
    // absolute joint target (metres or degrees), clamped to the joint's limits: used to drive axes to named positions
    setv: function (i, v) {
      const j = J[i]; if (!j) return; let lo = j.lo == null ? -Infinity : j.lo, hi = j.hi == null ? Infinity : j.hi;
      if (lo > hi) { const t = lo; lo = hi; hi = t; } tgt[i] = Math.max(lo, Math.min(hi, v));
    },
    set: function (i, frac) { if (i === "all") { for (let k = 0; k < n; k++) if (func[k]) tgt[k] = full[k] * frac; } else tgt[i] = full[i] * frac; },
    isOpen: function (i) { return Math.abs(tgt[i]) > 1e-9; },
    anyOpen: function () { return tgt.some(function (t, i) { return func[i] && Math.abs(t) > 1e-9; }); },
    // advance toward the targets; true while something moves
    step: function (dt) {
      let moving = false;
      for (let i = 0; i < n; i++) {
        if (val[i] === tgt[i]) continue;
        const sp = J[i].type === "revolute" ? 110 : Math.max(Math.abs(full[i]) / 0.8, 0.01), dv = tgt[i] - val[i], st = sp * dt;
        val[i] = Math.abs(dv) <= st ? tgt[i] : val[i] + Math.sign(dv) * st; moving = true;
      }
      if (moving) apply();
      return moving;
    },
    parts: function () { return parts.length; }
  };
}

/* Moving around, as in Isaac Sim's viewport:
   - hold the right mouse button and drag to look around; while it is held, W/S fly forward/back along the view,
     A/D left/right, Q/E down/up, and the wheel changes the flying speed (Shift = faster);
   - middle-drag pans; the wheel zooms toward the pointer; left-drag (or Alt+left-drag) orbits;
   - F frames the selected object (or the whole model); double-click flies to the point under the pointer.
   W/A/S/D/Q/E also work without the right button while the pointer is over the view or the view is full screen. */
function navigation(box, camera, controls, renderer, pickables, speed, frame) {
  controls.zoomToCursor = true; controls.screenSpacePanning = true;
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: null };
  const el = renderer.domElement, keys = new Set(); let over = false, rmb = null, mult = 1;
  const onEnter = function () { over = true; }, onLeave = function () { over = false; if (!rmb) keys.clear(); };
  box.addEventListener("pointerenter", onEnter); box.addEventListener("pointerleave", onLeave);
  const active = function () { return over || !!rmb || box.classList.contains("vfull") || document.fullscreenElement === box; };
  const KEYS = { KeyW: 1, KeyS: 1, KeyA: 1, KeyD: 1, KeyQ: 1, KeyE: 1, ArrowUp: 1, ArrowDown: 1, ArrowLeft: 1, ArrowRight: 1, ShiftLeft: 1, ShiftRight: 1 };
  const typing = function () { return /INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || ""); };
  const onDown = function (e) {
    if (typing() || !active()) return;
    if (e.code === "KeyF" && frame) { frame(); e.preventDefault(); return; }
    if (!KEYS[e.code]) return;
    keys.add(e.code); if (!/Shift/.test(e.code)) e.preventDefault();
  };
  const onUp = function (e) { keys.delete(e.code); };
  window.addEventListener("keydown", onDown); window.addEventListener("keyup", onUp); window.addEventListener("blur", onLeave);
  // right button: look around from where the camera stands (first person), keeping the orbit point in front of it
  const look = new THREE.Spherical(), dir = new THREE.Vector3();
  const onPDown = function (e) {
    if (e.button !== 2) return;
    rmb = { x: e.clientX, y: e.clientY, id: e.pointerId }; el.setPointerCapture(e.pointerId); e.preventDefault();
  };
  const onPMove = function (e) {
    if (!rmb || e.pointerId !== rmb.id) return;
    const dx = e.clientX - rmb.x, dy = e.clientY - rmb.y; rmb.x = e.clientX; rmb.y = e.clientY;
    dir.subVectors(controls.target, camera.position); const dist = Math.max(dir.length(), 1e-3);
    look.setFromVector3(dir);
    look.theta -= dx * 0.004; look.phi = Math.min(Math.PI - 0.05, Math.max(0.05, look.phi + dy * 0.004));
    dir.setFromSpherical(look).setLength(dist); controls.target.copy(camera.position).add(dir); controls.update();
  };
  const onPUp = function (e) { if (rmb && e.pointerId === rmb.id) { try { el.releasePointerCapture(e.pointerId); } catch (x) { /* gone */ } rmb = null; if (!over) keys.clear(); } };
  const onWheel = function (e) { if (!rmb) return; e.preventDefault(); e.stopImmediatePropagation(); mult = Math.min(8, Math.max(0.125, mult * (e.deltaY < 0 ? 1.25 : 0.8))); };
  const onCtx = function (e) { e.preventDefault(); };
  el.addEventListener("pointerdown", onPDown); el.addEventListener("pointermove", onPMove); el.addEventListener("pointerup", onPUp);
  el.addEventListener("wheel", onWheel, { capture: true, passive: false }); el.addEventListener("contextmenu", onCtx);
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let fly = null;
  function flyTo(toT, toC) { fly = { t0: performance.now(), fromT: controls.target.clone(), fromC: camera.position.clone(), toT: toT, toC: toC }; }
  const onDbl = function (e) {
    const r = el.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(pickables(), true).filter(function (h) { return h.object.visible && h.object.isMesh; })[0];
    if (!hit) return;
    flyTo(hit.point.clone(), hit.point.clone().add(camera.position.clone().sub(hit.point).multiplyScalar(0.45)));
  };
  el.addEventListener("dblclick", onDbl);
  const fwd = new THREE.Vector3(), side = new THREE.Vector3(), mv = new THREE.Vector3();
  return {
    flyTo: flyTo,
    tick: function (dt) {
      let moved = false;
      if (fly) {
        const k = Math.min((performance.now() - fly.t0) / 450, 1), s = k * k * (3 - 2 * k);
        controls.target.lerpVectors(fly.fromT, fly.toT, s); camera.position.lerpVectors(fly.fromC, fly.toC, s);
        if (k >= 1) fly = null; moved = true;
      }
      if (keys.size) {
        camera.getWorldDirection(fwd);                       // along the view, as Isaac Sim flies
        side.crossVectors(fwd, camera.up).normalize(); mv.set(0, 0, 0);
        if (keys.has("KeyW") || keys.has("ArrowUp")) mv.add(fwd);
        if (keys.has("KeyS") || keys.has("ArrowDown")) mv.sub(fwd);
        if (keys.has("KeyD") || keys.has("ArrowRight")) mv.add(side);
        if (keys.has("KeyA") || keys.has("ArrowLeft")) mv.sub(side);
        if (keys.has("KeyE")) mv.y += 1;
        if (keys.has("KeyQ")) mv.y -= 1;
        if (mv.lengthSq()) {
          const fast = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 3 : 1;
          mv.normalize().multiplyScalar(speed() * mult * fast * dt); camera.position.add(mv); controls.target.add(mv); moved = true;
        }
      }
      if (moved) controls.update();
      return moved;
    },
    dispose: function () {
      box.removeEventListener("pointerenter", onEnter); box.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); window.removeEventListener("blur", onLeave);
      el.removeEventListener("pointerdown", onPDown); el.removeEventListener("pointermove", onPMove); el.removeEventListener("pointerup", onPUp);
      el.removeEventListener("wheel", onWheel, { capture: true }); el.removeEventListener("contextmenu", onCtx); el.removeEventListener("dblclick", onDbl);
    }
  };
}

export function mount(box, url, onStatus) {
  const status = onStatus || function () {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(2, 4, 3);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.005, 200);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.addEventListener("start", function () { controls.autoRotate = false; });

  let alive = true, frame = 0, model = null, grid = null, modelR = 1, rig = null, last = performance.now();
  const nav = navigation(box, camera, controls, renderer, function () { return [model, col].filter(Boolean); }, function () { return modelR * 0.7; }, function () {
    if (!model) return;
    const b = new THREE.Box3().setFromObject(model), c = b.getCenter(new THREE.Vector3()), r = Math.max(b.getSize(new THREE.Vector3()).length() * 0.6, 0.05);
    nav.flyTo(c, c.clone().add(new THREE.Vector3(r * 1.1, r * 0.7, r * 1.4)));
  });
  function resize() {
    const w = box.clientWidth || 400, h = box.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(box);
  resize();

  function loop() {
    if (!alive) return;
    frame = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.25); last = now;
    if (nav.tick(dt)) controls.autoRotate = false;
    if (rig) rig.step(dt);
    controls.update();
    renderer.render(scene, camera);
  }

  status("Loading 3D model…");
  newLoader().load(url, function (gltf) {
    if (!alive) return;
    model = glassify(gltf.scene);
    scene.add(model);
    const b = new THREE.Box3().setFromObject(model), size = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
    const r = Math.max(size.x, size.y, size.z) || 1; modelR = r;
    grid = new THREE.GridHelper(r * 2.4, 12, 0x9aa3b1, 0xc9ced6);
    grid.position.set(c.x, b.min.y, c.z);
    grid.material.transparent = true;
    grid.material.opacity = 0.55;
    scene.add(grid);
    controls.target.copy(c);
    camera.position.set(c.x + r * 1.5, c.y + r * 0.9, c.z + r * 1.9);
    camera.near = r / 200; camera.far = r * 50; camera.updateProjectionMatrix();
    controls.minDistance = r * 0.05; controls.maxDistance = r * 8;
    controls.update();
    status("");
    applyMode();
    loop();
  }, function (e) {
    if (e.total) status("Loading 3D model… " + Math.round(100 * e.loaded / e.total) + "%");
  }, function () {
    status("The 3D model could not be loaded.");
  });

  let col = null, colLoading = false, wanted = "model";
  function applyMode() {
    if (!model) return;
    model.visible = wanted !== "col";
    if (col) { col.visible = wanted !== "model"; setCollisionLook(col, wanted === "both" ? "outline" : "solid"); }
  }
  function setMode(mode, colUrl) {
    wanted = mode;
    if (mode !== "model" && !col && colUrl && !colLoading) {
      colLoading = true;
      status("Loading collision shapes…");
      newLoader().load(colUrl, function (g) {
        if (!alive) return;
        col = styleCollision(g.scene); offsetModel(model);
        scene.add(col); if (rig) rig.attach(col, true); status(""); applyMode();
      }, undefined, function () { status("Collision shapes could not be loaded."); });
    }
    applyMode();
  }

  let jointsObj = null;
  function setJoints(jm, on) {
    if (jointsObj) { scene.remove(jointsObj); jointsObj = null; }
    if (on && model) {
      const s = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
      jointsObj = jointMarkers(jm, Math.max(s.x, s.y, s.z)); scene.add(jointsObj);
    }
  }

  return {
    setMode: setMode,
    setJoints: setJoints,
    // moving parts that really open: ar from assets/artic/<id>.json; open("all" | joint index, true/false or 0..1)
    setArtic: function (ar) {
      if (!model) return null;
      rig = makeRig(ar); rig.attach(model, false); if (col) rig.attach(col, true);
      return rig;
    },
    open: function (which, on) { if (!rig) return; controls.autoRotate = false; rig.set(which, on === true ? 1 : on === false ? 0 : on); },
    colourBy: function (v) { setColourBy(v); applyMode(); },
    highlight: function (i) { return rig ? rig.highlight(i) : 0; },
    setJointValue: function (i, v) { if (rig) { controls.autoRotate = false; rig.setv(i, v); } },
    // the loaded file is a collision export (no visual preview exists): draw it as collision solids
    styleAsCollision: function () { if (model) { styleCollision(model); setCollisionLook(model, "solid"); } },
    // paint visual meshes whose names start with one of these (e.g. a lid), or clear with null
    highlightNames: function (names) {
      if (!model) return 0; let k = 0;
      model.traverse(function (o) {
        if (!o.isMesh) return;
        if (o.userData.nameHl) { o.material = o.userData.nameHl; delete o.userData.nameHl; }
        if (!names) return;
        let p = o, hit = false;
        while (p && p !== model && !hit) { const bare = (p.name || "").replace(/^\d{3}_/, ""); hit = names.some(function (n) { return bare === n || bare.startsWith(n + "_"); }); p = p.parent; }
        if (hit) { o.userData.nameHl = o.material; o.material = NAME_HL; k++; }
      });
      return k;
    },
    state: function () { return { mode: wanted, model: !!model, modelVisible: !!(model && model.visible), collision: !!col, collisionVisible: !!(col && col.visible), loadingCollision: colLoading, rigParts: rig ? rig.parts() : 0 }; },
    reset: function () { if (model) { controls.autoRotate = true; } },
    dispose: function () {
      alive = false;
      cancelAnimationFrame(frame);
      ro.disconnect(); nav.dispose();
      controls.dispose();
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
          Object.keys(m).forEach(function (k) { if (m[k] && m[k].isTexture) m[k].dispose(); });
          m.dispose();
        });
      });
      if (col) col.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
      envTex.dispose(); pmrem.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}

/* Whole room: the room shell plus every asset instance placed from room.json
   ({shell, bounds, instances: [{id, name, p, q, s, box, glb}]}). Instances without a preview model are grey boxes. */
export function mountRoom(box, roomUrl, onStatus, onPick) {
  const status = onStatus || function () {}, pickCb = onPick || function () {};
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  box.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f99, 0.7));
  const sun = new THREE.DirectionalLight(0xffffff, 1.0); sun.position.set(4, 8, 5); scene.add(sun);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 400);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  const cut = new THREE.Plane(new THREE.Vector3(0, -1, 0), 2.4);
  renderer.clippingPlanes = [cut];
  let alive = true, frame = 0, sel = null;
  // render on demand: while the camera moves (damping) or after something changes, not 60 times a second
  let dirty = 2;
  function want() { dirty = Math.max(dirty, 2); }
  const root = new THREE.Group(); scene.add(root);
  const rigs = new Set(); let last = performance.now();
  let api = null;
  const nav = navigation(box, camera, controls, renderer, function () { return [root]; }, function () { return 1.6; }, function () {
    if (sel && api) { api.focus(); return; }
    const b = new THREE.Box3().setFromObject(root), c = b.getCenter(new THREE.Vector3()), r = Math.max(b.getSize(new THREE.Vector3()).length() * 0.5, 1);
    nav.flyTo(c, c.clone().add(new THREE.Vector3(r * 0.5, r * 0.9, r * 0.7)));
  });
  function resize() { const w = box.clientWidth || 400, h = box.clientHeight || 300; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); want(); }
  const ro = new ResizeObserver(resize); ro.observe(box); resize();
  controls.addEventListener("change", want);
  function loop() {
    if (!alive) return; frame = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min((now - last) / 1000, 0.25); last = now;
    if (nav.tick(dt)) dirty = Math.max(dirty, 1);
    rigs.forEach(function (r) { if (r.step(dt)) dirty = Math.max(dirty, 1); });
    if (controls.update()) dirty = Math.max(dirty, 1);
    if (dirty > 0) { if (sel && sel.update) sel.update(); renderer.render(scene, camera); dirty--; }
  }
  const loader = newLoader(), cache = new Map();
  function model(url) { if (!cache.has(url)) cache.set(url, loader.loadAsync(url).then(function (g) { return /\/collision\//.test(url) ? g.scene : glassify(g.scene); })); return cache.get(url); }
  const grey = new THREE.MeshStandardMaterial({ color: 0xb8bec8, roughness: 0.85, transparent: true, opacity: 0.85 });
  const insts = [], robots = []; let shellObj = null, roomMode = "model", colLoaded = false, colBase = null, colShellUrl = null, colShell = null;
  const KIND_COLOR = { convexHull: 0x2980ff, convexDecomposition: 0x0db380, mesh: 0xff8514, none: 0xff8514, meshSimplification: 0xff8514,
    sdf: 0xbf4de6, boundingCube: 0xe6bf0d, boundingSphere: 0xe6bf0d, primitive: 0xd6336c };
  // "Operable?" view: each object painted by whether it can be operated (colours chosen by the page)
  let opMap = null; const opMats = {};
  function opMat(hex) { if (!opMats[hex]) opMats[hex] = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8, metalness: 0, flatShading: true }); return opMats[hex]; }
  function paintOp(g, on) {
    g.children.forEach(function (c) {
      if (c.userData.isCol || c.userData.selCol || c.userData.isJoints) return;
      c.traverse(function (o) {
        if (!o.isMesh) return;
        if (on) { if (!o.userData.origMat) o.userData.origMat = o.material; o.material = opMat(opMap && opMap[g.userData.id] != null ? opMap[g.userData.id] : 0xb8bec8); }
        else if (o.userData.origMat) { o.material = o.userData.origMat; delete o.userData.origMat; }
      });
    });
  }
  function applyRoomMode() {
    insts.forEach(function (g) {
      g.children.forEach(function (c) {
        if (c.userData.isCol) { c.visible = roomMode === "both" || roomMode === "col"; setCollisionLook(c, roomMode === "both" ? "outline" : "solid"); }
        else if (!c.userData.isJoints && !c.userData.selCol) c.visible = roomMode !== "col";
      });
      paintOp(g, roomMode === "op");
    });
    if (shellObj) shellObj.visible = roomMode !== "col" || !colShell;
    if (roomMode === "op" && sel && sel.userData.target) { /* keep the selection box */ }
    if (colShell) { colShell.visible = roomMode === "both" || roomMode === "col"; setCollisionLook(colShell, roomMode === "both" ? "outline" : "solid"); }
    want();
  }
  function loadRoomCollision() {
    if (colLoaded || !colBase) return Promise.resolve(); colLoaded = true;
    const withCol = insts.filter(function (g) { return g.userData.col; }); let k = 0;
    const shellCol = colShellUrl ? loader.loadAsync(new URL(colShellUrl, colBase).href).then(function (g) {
      // the room's own colliders (walls, floor, benches): no normals, so flat colours by collider kind
      colShell = styleCollision(g.scene);
      root.add(colShell);
    }, function () {}) : Promise.resolve();
    status("Loading collision shapes 0/" + withCol.length + "…");
    return Promise.all(withCol.map(function (g) {
      return model(new URL(g.userData.col, colBase).href).then(function (sc) {
        const c = styleCollision(sc.clone(true)); c.userData.isCol = true;
        g.add(c); if (g.userData.rig) g.userData.rig.attach(c, true);
      }, function () {}).then(function () { k++; if (k % 5 === 0) status("Loading collision shapes " + k + "/" + withCol.length + "…"); });
    }).concat([shellCol])).then(function () { status(""); applyRoomMode(); });
  }

  status("Loading the room…");
  fetch(roomUrl).then(function (r) { return r.json(); }).then(function (room) {
    const b = room.bounds || [[-3, 0, -3], [3, 3, 3]];
    const lo = new THREE.Vector3().fromArray(b[0]), hi = new THREE.Vector3().fromArray(b[1]);
    const c = lo.clone().add(hi).multiplyScalar(0.5), size = hi.clone().sub(lo), R = Math.max(size.x, size.z) || 6;
    cut.constant = Math.min(hi.y - 0.45, lo.y + 2.4);
    controls.target.set(c.x, lo.y + 0.8, c.z);
    camera.position.set(c.x + R * 0.55, lo.y + R * 0.95, c.z + R * 0.75);
    controls.maxDistance = R * 4; controls.update();
    loop();
    const base = new URL("../../../", roomUrl);  // room.json lives in assets/scenes/<id>/; paths inside are site-relative
    colBase = base; colShellUrl = room.colshell || null;
    return model(new URL(room.shell, base).href).then(function (shell) {
      if (!alive) return;
      root.add(shell); shellObj = shell; want();
      const inst = room.instances || [], n = inst.length; let done = 0;
      status("Placing objects 0/" + n + "…");
      return Promise.all(inst.map(function (x) {
        const g = new THREE.Group();
        g.position.fromArray(x.p); g.quaternion.set(x.q[0], x.q[1], x.q[2], x.q[3]);
        if (Array.isArray(x.s)) g.scale.fromArray(x.s); else g.scale.setScalar(x.s || 1);  // per-axis scale on the model's own axes
        g.userData = { id: x.id, name: x.name, col: x.col || null };
        root.add(g); insts.push(g);
        const fallback = function () {
          const s = x.box || [0.2, 0.2, 0.2], m = new THREE.Mesh(new THREE.BoxGeometry(s[0], s[1], s[2]), grey);
          m.position.y = s[1] / 2; g.add(m);
        };
        const p = x.glb ? model(new URL(x.glb, base).href).then(function (sc) { g.add(sc.clone(true)); }, fallback) : Promise.resolve(fallback());
        return p.then(function () { done++; if (done % 5 === 0 || done === n) status(done === n ? "" : "Placing objects " + done + "/" + n + "…"); });
      })).then(function () {
        // step1's simplified robots (robots-web3d/1): GLB in the robot's own Z-up frame; pose_world is USD's row-major
        // matrix (row vectors), so fromArray (column-major) gives the column-vector form; then the scene's Z-up -> Y-up turn
        return Promise.all((room.robots || []).map(function (r) {
          return model(new URL(r.glb, base).href).then(function (sc) {
            if (!alive) return;
            const wrap = new THREE.Group(), pose = new THREE.Group(), body = sc.clone(true);
            wrap.rotation.x = -Math.PI / 2;
            pose.matrixAutoUpdate = false; pose.matrix.fromArray(r.m);
            (r.hide || []).forEach(function (nm) { body.traverse(function (o) { if (o.name === nm) o.visible = false; }); });
            pose.add(body); wrap.add(pose);
            wrap.userData = { id: "robot:" + r.id, name: r.model, robot: { model: r.model, kind: r.kind, reach: r.reach } };
            root.add(wrap); robots.push(wrap); want();
          }, function () { /* a missing robot model leaves the room usable */ });
        }));
      }).then(function () { status(""); });
    });
  }).catch(function () { status("The room could not be loaded."); });

  // click (not drag) names the object under the pointer
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(); let down = null;
  renderer.domElement.addEventListener("pointerdown", function (e) { down = e.button === 0 ? [e.clientX, e.clientY] : null; });
  renderer.domElement.addEventListener("pointerup", function (e) {
    if (e.button !== 0 || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hits = ray.intersectObjects(root.children.slice(1), true).filter(function (h) { return h.point.y <= cut.constant || !renderer.clippingPlanes.length; });
    let o = hits.length ? hits[0].object : null;
    while (o && !(o.userData && o.userData.id)) o = o.parent;
    select(o);
  });
  function select(o) {
    if (sel) { scene.remove(sel); sel.dispose && sel.dispose(); sel = null; }
    if (o) { sel = new THREE.BoxHelper(o, 0xff6a00); sel.userData.target = o; scene.add(sel); }
    want();
    pickCb(o ? { id: o.userData.id, name: o.userData.name, robot: o.userData.robot || null } : null);
  }

  api = {
    colourBy: function (v) { setColourBy(v); applyRoomMode(); },
    setCut: function (on) { renderer.clippingPlanes = on ? [cut] : []; want(); },
    setMode: function (mode) { roomMode = mode; applyRoomMode(); if (mode === "both" || mode === "col") loadRoomCollision(); },
    setOpColours: function (m) { opMap = m; if (roomMode === "op") applyRoomMode(); },
    // inspector for the selected object
    isolate: function (on) {
      const s = sel && sel.userData.target; if (!s) return;
      insts.forEach(function (g) { g.visible = !on || g === s; });
      if (shellObj) shellObj.visible = !on; if (colShell) colShell.visible = !on && (roomMode === "both" || roomMode === "col"); want();
    },
    selCollision: function (on) {
      const s = sel && sel.userData.target; if (!s || !s.userData.col) return Promise.resolve(false);
      let c = s.children.filter(function (x) { return x.userData.selCol; })[0];
      if (!on) { if (c) s.remove(c); want(); return Promise.resolve(true); }
      if (c) return Promise.resolve(true);
      return model(new URL(s.userData.col, colBase).href).then(function (sc) {
        const k = styleCollision(sc.clone(true)); k.userData.selCol = true; setCollisionLook(k, "outline");
        s.add(k); if (s.userData.rig) s.userData.rig.attach(k, true); want(); return true;
      });
    },
    selJoints: function (jm, on) {
      const s = sel && sel.userData.target; if (!s) return;
      s.children.filter(function (x) { return x.userData.isJoints; }).forEach(function (x) { s.remove(x); });
      if (on) { const b = new THREE.Box3().setFromObject(s).getSize(new THREE.Vector3()); s.add(jointMarkers(jm, Math.max(b.x, b.y, b.z) / Math.max(s.scale.x, s.scale.y, s.scale.z, 1e-6))); }
      want();
    },
    // open or close the selected object's doors, lids and drawers (ar from assets/artic/<id>.json)
    selOpen: function (ar, on) {
      const s = sel && sel.userData.target; if (!s || !ar) return 0;
      if (!s.userData.rig) {
        const r = makeRig(ar);
        s.children.forEach(function (c) { if (c.userData.isJoints) return; r.attach(c, !!(c.userData.isCol || c.userData.selCol)); });
        s.userData.rig = r; rigs.add(r);
      }
      s.userData.rig.set("all", on ? 1 : 0); want();
      return s.userData.rig.parts();
    },
    // move one part (joint index) or "all" of the selected object, open or closed
    selSet: function (ar, which, on) {
      const s = sel && sel.userData.target; if (!s || !ar) return 0;
      if (!s.userData.rig) {
        const r = makeRig(ar);
        s.children.forEach(function (c) { if (c.userData.isJoints) return; r.attach(c, !!(c.userData.isCol || c.userData.selCol)); });
        s.userData.rig = r; rigs.add(r);
      }
      s.userData.rig.set(which, on ? 1 : 0); want();
      return s.userData.rig.parts();
    },
    selHighlight: function (ar, i) {
      const s = sel && sel.userData.target; if (!s || !ar) return 0;
      if (!s.userData.rig) { const r = makeRig(ar); s.children.forEach(function (c) { if (c.userData.isJoints) return; r.attach(c, !!(c.userData.isCol || c.userData.selCol)); }); s.userData.rig = r; rigs.add(r); }
      const n = s.userData.rig.highlight(i); want(); return n;
    },
    // diagnostics: where each placed model's lowest point ends up against its placement origin (should be ~0)
    bottoms: function () {
      return insts.map(function (g) {
        const m = g.children.filter(function (c) { return !c.userData.isCol && !c.userData.selCol && !c.userData.isJoints; })[0];
        if (!m) return null; const b = new THREE.Box3().setFromObject(m);
        return [g.userData.id, g.userData.name, +g.position.y.toFixed(4), +b.min.y.toFixed(4), +(b.min.y - g.position.y).toFixed(4)];
      }).filter(Boolean);
    },
    // diagnostics: gap between each object's lowest point and the first surface below it (floating > 0, through < 0)
    floating: function () {
      const rc = new THREE.Raycaster(), out = [], down = new THREE.Vector3(0, -1, 0);
      root.updateMatrixWorld(true);
      const targets = [shellObj].concat(insts).filter(Boolean);
      insts.forEach(function (g) {
        const m = g.children.filter(function (c) { return !c.userData.isCol && !c.userData.selCol && !c.userData.isJoints; })[0];
        if (!m) return; const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3());
        const others = targets.filter(function (t) { return t !== g; });
        let best = null;
        [[0, 0], [0.25, 0.25], [-0.25, 0.25], [0.25, -0.25], [-0.25, -0.25]].forEach(function (f) {
          const o = new THREE.Vector3(c.x + f[0] * (b.max.x - b.min.x), b.min.y + 0.002, c.z + f[1] * (b.max.z - b.min.z));
          rc.set(o, down); rc.far = 3;
          const h = rc.intersectObjects(others, true).filter(function (x) { return x.object.visible && x.object.isMesh; })[0];
          if (h && (best === null || h.distance < best)) best = h.distance;
        });
        out.push([g.userData.id, g.userData.name, best === null ? null : +(best - 0.002).toFixed(4), +(b.max.y - b.min.y).toFixed(3)]);
      });
      return out;
    },
    // select the first placed copy of an asset (from the scene's asset list), as a click on it would
    selectId: function (id) { const g = insts.concat(robots).filter(function (x) { return x.userData.id === id; })[0]; if (g) select(g); return !!g; },
    focus: function () {
      const s = sel && sel.userData.target; if (!s) return;
      const b = new THREE.Box3().setFromObject(s), c = b.getCenter(new THREE.Vector3()), r = Math.max(b.getSize(new THREE.Vector3()).length(), 0.3);
      controls.target.copy(c); camera.position.copy(c).add(new THREE.Vector3(r * 0.9, r * 0.8, r * 1.1)); controls.update(); want();
    },
    // fit the camera to a set of Y-up world points (e.g. the objects one experiment uses); keeps the room's cut plane
    frame: function (pts) {
      if (!pts || !pts.length) return;
      const b = new THREE.Box3(); pts.forEach(function (q) { b.expandByPoint(new THREE.Vector3(q[0], q[1], q[2])); });
      const c = b.getCenter(new THREE.Vector3()), r = Math.max(b.getSize(new THREE.Vector3()).length() * 0.85, 2.6);
      controls.target.copy(c); camera.position.set(c.x + r * 0.7, c.y + r * 1.1, c.z + r * 0.9); controls.update(); want();
    },
    robots: function () { return robots.length; },
    setRobots: function (on) { robots.forEach(function (g) { g.visible = on; }); want(); },
    clearSelection: function () { if (sel) { scene.remove(sel); sel = null; } insts.forEach(function (g) { g.visible = true; }); if (shellObj) shellObj.visible = !(roomMode === "col" && colShell); want(); },
    state: function () { const d = new THREE.Vector3(); camera.getWorldDirection(d); return { mode: roomMode, instances: insts.length, collisionLoaded: colLoaded, cam: camera.position.toArray().map(function (x) { return +x.toFixed(3); }), dir: d.toArray().map(function (x) { return +x.toFixed(3); }) }; },
    dispose: function () {
      alive = false; cancelAnimationFrame(frame); ro.disconnect(); nav.dispose(); controls.dispose();
      scene.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
          Object.keys(m).forEach(function (k) { if (m[k] && m[k].isTexture) m[k].dispose(); }); m.dispose();
        });
      });
      envTex.dispose(); pmrem.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
  return api;
}
