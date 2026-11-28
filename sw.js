/* Decrypts the private OminiLab site in the browser. Every file except the page shells, code, styles, fonts and
   vendor libraries is published as <path>.enc = 12-byte IV + AES-GCM(ciphertext + tag), with the path as
   additional data. The site key comes from IndexedDB, where secure.js stores it after sign-in. */
const PLAIN = /(^|\/)[^/]*\.html$|^(secure\.js|sw\.js|auth\.json|robots\.txt|README\.md)$|^assets\/(fonts|vendor)\/|^assets\/[^/]+\.(js|css)$/;
const TYPES = { js: "application/javascript; charset=utf-8", json: "application/json; charset=utf-8", glb: "model/gltf-binary",
  webp: "image/webp", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", svg: "image/svg+xml", csv: "text/csv; charset=utf-8",
  md: "text/markdown; charset=utf-8", txt: "text/plain; charset=utf-8", mp4: "video/mp4" };
let cached = null;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
const STORE = "ominilab-decrypted-v1";
self.addEventListener("message", (e) => { if (e.data === "signout") { cached = null; e.waitUntil(caches.delete(STORE)); } });

function getKey() {
  if (cached && cached.exp > Date.now()) return Promise.resolve(cached.key);
  return new Promise((res) => {
    const r = indexedDB.open("ominilab-auth", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("k");
    r.onerror = () => res(null);
    r.onsuccess = () => {
      const q = r.result.transaction("k", "readonly").objectStore("k").get("site");
      q.onsuccess = () => { const v = q.result; cached = v && v.exp > Date.now() ? v : null; r.result.close(); res(cached ? cached.key : null); };
      q.onerror = () => { r.result.close(); res(null); };
    };
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url), scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const rel = decodeURIComponent(url.pathname.slice(scope.pathname.length));
  if (!rel || rel.endsWith("/") || rel.endsWith(".enc") || PLAIN.test(rel)) return;
  e.respondWith(serve(rel, url.search));
});

// data/manifest.json (encrypted like the rest) lists a content fingerprint per file for the current build.
let manifest = null, manifestAt = 0;
async function getManifest(key) {
  if (manifest && Date.now() - manifestAt < 120000) return manifest;
  try {
    const r = await fetch(new URL("data/manifest.json.enc?t=" + Date.now(), self.registration.scope).href, { cache: "no-store" });
    if (r.ok) {
      const buf = await r.arrayBuffer();
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12), additionalData: new TextEncoder().encode("data/manifest.json") }, key, buf.slice(12));
      manifest = JSON.parse(new TextDecoder().decode(plain)); manifestAt = Date.now();
    }
  } catch (e) { /* keep the previous manifest, or none */ }
  return manifest || {};
}

async function serve(rel, search) {
  const key = await getKey();
  if (!key) return new Response("Sign in required", { status: 401, headers: { "Content-Type": "text/plain" } });
  // Decrypted copies stay in this browser's Cache Storage (cleared on sign-out), keyed by path + fingerprint, so a model
  // or room opened before loads at once and is refetched only when its content changes.
  const fp = (await getManifest(key))[rel] || "";
  const cache = await caches.open(STORE);
  const ckey = new URL("__dec/" + rel + "?f=" + fp + (search ? "&" + search.slice(1) : ""), self.registration.scope).href;
  if (fp || search) { const hit = await cache.match(ckey); if (hit) return hit; }
  const r = await fetch(new URL(rel + ".enc" + (fp ? "?f=" + fp : search), self.registration.scope).href);
  if (!r.ok) return new Response("Not found", { status: r.status });
  const buf = await r.arrayBuffer();
  try {
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.slice(0, 12), additionalData: new TextEncoder().encode(rel) }, key, buf.slice(12));
    const ext = (rel.split(".").pop() || "").toLowerCase();
    const res = new Response(plain, { headers: { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": "no-store" } });
    if (fp || search) cache.put(ckey, res.clone()).catch(() => {});
    return res;
  } catch (err) {
    return new Response("Could not decrypt", { status: 403 });
  }
}
