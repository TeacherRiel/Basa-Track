const CACHE = "basa-track-v8";
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

  if (url.hostname.endsWith("github.io")) {
    const syncSrc = new URL("/Basa-Track/cloud-sync.js", url.origin).href;
    if (!text.includes("/Basa-Track/cloud-sync.js")) {
      patched = patched.replace(/<\/body>/i, '<script src="' + syncSrc + '"></script></body>');
    }
  }

  if (url.searchParams.get("learner") === "1") {
    patched = patched.replace(/<\/head>/i,
      '<style id="basa-learner-only">#home button:nth-of-type(2),#teacher,#teacherLogin,#pupilManager,#rosterEditor,#teacherBackBtn{display:none!important}</style></head>');
    patched = patched.replace(/<\/body>/i,
      '<script>(function(){function hide(){try{document.querySelectorAll("#home button").forEach(function(b,i){if(i===1||/Teacher Dashboard/i.test(b.textContent||""))b.style.display="none"});["teacher","teacherLogin","pupilManager","rosterEditor","teacherBackBtn"].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display="none"});}catch(e){}}setTimeout(hide,50);setTimeout(hide,500);setTimeout(hide,1500);new MutationObserver(hide).observe(document.documentElement,{subtree:true,childList:true,attributes:true});})();</script></body>');
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
