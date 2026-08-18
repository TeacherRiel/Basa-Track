const CACHE = "basa-track-v5";
const ASSETS = [
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./cloud-sync.js"
];

async function patchDocument(response, request) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;
  const text = await response.text();
  const url = new URL(request.url);
  let patched = text;
  if (url.searchParams.get("learner") === "1") {
    patched = patched.replace(/<\/head>/i,
      '<style id="basa-learner-only">#home button[onclick*="show(\'teacher\')"],#home button[onclick*="show(\\\'teacher\\\')"]{display:none!important}</style></head>');
    patched = patched.replace(/<\/body>/i,
      '<script>(function(){setTimeout(function(){try{document.querySelectorAll("#home button").forEach(function(b){if(/Teacher Dashboard/i.test(b.textContent||""))b.style.display="none"});if(typeof window.show==="function")window.show("login");}catch(e){}},300);})();</script></body>');
  }
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(patched, {headers, status: response.status, statusText: response.statusText});
}

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const isDocument = event.request.destination === "document" || (event.request.headers.get("accept") || "").includes("text/html");
  if (isDocument) {
    event.respondWith(
      fetch(event.request).then(async response => {
        const patched = await patchDocument(response.clone(), event.request);
        const cache = await caches.open(CACHE);
        await cache.put(event.request, patched.clone());
        return patched;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
