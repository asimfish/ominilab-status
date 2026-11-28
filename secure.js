/* Sign-in and loader for the private OminiLab site.
   Published content is AES-GCM encrypted (*.enc); sw.js decrypts it in the browser with a site key.
   Signing in derives a key from account + password (PBKDF2-SHA-256) that unwraps the site key. Only the
   unwrapped site key is cached, as a non-extractable CryptoKey in IndexedDB; the password is never stored.
   Without auth.json (local development) the page scripts load directly. */
(function () {
  "use strict";
  var me = document.currentScript;
  var meta = document.querySelector('meta[name="ol-build"]');
  var build = meta ? meta.content : "";
  var list = (me.getAttribute("data-load") || "").split(/\s+/).filter(Boolean);
  window.OL_BUILD = build;
  var DB = "ominilab-auth", STORE = "k", REC = "site";
  var REMEMBER_MS = 30 * 24 * 3600 * 1000, SESSION_MS = 12 * 3600 * 1000;

  function loadScripts() {
    list.forEach(function (src) {
      var s = document.createElement("script");
      s.src = src + (build ? (src.indexOf("?") < 0 ? "?" : "&") + "v=" + build : "");
      s.async = false;
      document.body.appendChild(s);
    });
  }
  function idb(mode, fn) {
    return new Promise(function (res, rej) {
      var r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
      r.onerror = function () { rej(r.error); };
      r.onsuccess = function () {
        var tx = r.result.transaction(STORE, mode), st = tx.objectStore(STORE), q = fn(st);
        tx.oncomplete = function () { res(q && q.result); r.result.close(); };
        tx.onerror = function () { rej(tx.error); };
      };
    });
  }
  function getKey() {
    return idb("readonly", function (st) { return st.get(REC); }).then(function (rec) {
      return rec && rec.exp > Date.now() ? rec.key : null;
    }, function () { return null; });
  }
  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }

  function signOut() {
    return idb("readwrite", function (st) { return st.delete(REC); }).catch(function () {}).then(function () {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage("signout");
      if (window.caches) caches.delete("ominilab-decrypted-v1").catch(function () {});
      location.reload();
    });
  }
  window.OL_SIGNOUT = signOut;

  function addSignOut() {
    var host = document.querySelector(".top-right");
    if (!host || document.getElementById("signOut")) return;
    var b = document.createElement("button");
    b.id = "signOut"; b.type = "button"; b.className = "icon-btn"; b.textContent = "Sign out";
    b.addEventListener("click", signOut);
    host.insertBefore(b, host.firstChild);
  }

  function ensureWorker() {
    if (!("serviceWorker" in navigator) || !window.indexedDB || !(window.crypto && crypto.subtle))
      return Promise.reject(new Error("This browser window cannot open the private site. Use a normal (not private) window of Chrome, Edge, Safari or Firefox."));
    return navigator.serviceWorker.register("sw.js", { scope: "./" }).then(function () { return navigator.serviceWorker.ready; }).then(function () {
      if (navigator.serviceWorker.controller) { try { sessionStorage.removeItem("olReloaded"); } catch (e) { /* ignore */ } return; }
      // A first sign-in is taken over by the new worker within a moment. A hard refresh (Cmd/Ctrl+Shift+R) bypasses
      // the worker for that page, so the page is reloaded once, normally.
      return new Promise(function (res, rej) {
        var done = false;
        navigator.serviceWorker.addEventListener("controllerchange", function () { done = true; res(); }, { once: true });
        setTimeout(function () {
          if (done) return;
          var again = false; try { again = sessionStorage.getItem("olReloaded") === "1"; sessionStorage.setItem("olReloaded", "1"); } catch (e) { /* ignore */ }
          if (again) rej(new Error("The page could not start its decryption helper. Close this tab and open the site again."));
          else location.reload();
        }, 1500);
      });
    });
  }

  function showLogin(auth, msg) {
    var wrap = document.createElement("div");
    wrap.className = "ol-login";
    wrap.innerHTML = '<form class="ol-login-card" autocomplete="on"><div class="ol-login-brand">OminiLab</div>' +
      '<p class="muted">Private progress site. Sign in to continue.</p>' +
      '<label>Account<input name="u" autocomplete="username" required autocapitalize="none" spellcheck="false"></label>' +
      '<label>Password<input name="p" type="password" autocomplete="current-password" required autocapitalize="none" spellcheck="false"></label>' +
      '<label class="ol-login-rem"><input name="s" type="checkbox"> Show password</label>' +
      '<label class="ol-login-rem"><input name="r" type="checkbox" checked> Remember this device for 30 days</label>' +
      '<button class="btn" type="submit">Sign in</button><p class="ol-login-msg" role="alert"></p></form>';
    document.body.appendChild(wrap);
    document.body.classList.add("ol-locked");
    var f = wrap.querySelector("form"), out = wrap.querySelector(".ol-login-msg"), btn = f.querySelector("button");
    if (msg) out.textContent = msg;
    f.u.focus();
    f.s.addEventListener("change", function () { f.p.type = f.s.checked ? "text" : "password"; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      btn.disabled = true; out.textContent = "Checking…";
      var enc = new TextEncoder();
      if (!(window.crypto && crypto.subtle)) { btn.disabled = false; out.textContent = "This browser cannot open the private site. Open the link in Safari or Chrome (not inside a chat app)."; return; }
      var norm = function (s) { return (s.normalize ? s.normalize("NFKC") : s).trim(); };
      var acct = norm(f.u.value).toLowerCase(), pw = norm(f.p.value);
      var hex = function (buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); };
      crypto.subtle.digest("SHA-256", enc.encode("ominilab-account:" + acct)).then(function (h) {
        if (auth.account_sha256 && hex(h) !== auth.account_sha256) {
          var e = new Error('Unknown account "' + acct + '". Check that the input method is in English (not pinyin or full-width).'); e.known = true; throw e;
        }
        return crypto.subtle.importKey("raw", enc.encode(auth.account_sha256 ? pw : acct + ":" + pw), "PBKDF2", false, ["deriveKey"]);
      }).then(function (base) {
        return crypto.subtle.deriveKey({ name: "PBKDF2", salt: b64(auth.salt), iterations: auth.iter, hash: "SHA-256" }, base,
          { name: "AES-GCM", length: 256 }, false, ["unwrapKey"]);
      }).then(function (kek) {
        return crypto.subtle.unwrapKey("raw", b64(auth.wrapped), kek, { name: "AES-GCM", iv: b64(auth.iv), additionalData: enc.encode(auth.aad) },
          { name: "AES-GCM" }, false, ["decrypt"]);
      }).then(function (key) {
        var exp = Date.now() + (f.r.checked ? REMEMBER_MS : SESSION_MS);
        return idb("readwrite", function (st) { return st.put({ key: key, exp: exp }, REC); });
      }, function (e) { if (e && e.known) throw e; throw new Error(auth.account_sha256 ? "Wrong password. Tick \u201cShow password\u201d to check what you typed." : "Wrong account or password."); }).then(function () {
        out.textContent = "Opening…";
        return ensureWorker();
      }).then(function () {
        wrap.remove(); document.body.classList.remove("ol-locked"); addSignOut(); loadScripts();
      }).catch(function (err) {
        btn.disabled = false;
        out.textContent = err && err.message ? err.message + (err.known || /Wrong|Unknown|browser/.test(err.message) ? "" : " (" + (err.name || "error") + ")") : "Sign-in failed.";
        f.p.value = ""; f.p.focus();
      });
    });
  }

  fetch("auth.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }, function () { return null; }).then(function (auth) {
    if (!auth) { loadScripts(); return; }                       // local development: plain files
    return getKey().then(function (key) {
      if (!key) return showLogin(auth);
      return ensureWorker().then(function () { addSignOut(); loadScripts(); }, function (e) { showLogin(auth, e.message); });
    }).catch(function (e) { showLogin(auth, (e && e.message) || "Please sign in again."); });
  });
})();
