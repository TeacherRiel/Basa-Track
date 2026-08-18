const CACHE = "basa-track-v19";
const ASSETS = ["./manifest.json","./icon-192.png","./icon-512.png","./cloud-sync.js","./teacher-preview.js"];

async function patchDocument(response, request){
  const contentType=response.headers.get("content-type")||"";
  if(!contentType.includes("text/html")) return response;
  const text=await response.text();
  const url=new URL(request.url);
  let patched=text;
  if(url.hostname.endsWith("github.io") && !text.includes("basa-cloud-bootstrap")){
    const bootstrap=`<script id="basa-cloud-bootstrap">(function(){function load(){if(window.__basaCloudLoaded)return;if(typeof window.login==='function'&&typeof window.save==='function'&&typeof window.teacher==='function'){window.__basaCloudLoaded=true;var s=document.createElement('script');s.id='basa-cloud-sync-script';s.src='/Basa-Track/cloud-sync.js?v=19';s.onload=function(){var p=document.createElement('script');p.id='basa-teacher-preview-script';p.src='/Basa-Track/teacher-preview.js?v=19';p.onload=function(){function route(){try{var q=new URL(location.href).searchParams;if(q.get('learner')==='1'){document.querySelectorAll('#home button').forEach(function(b,i){if(i===1||/Teacher Dashboard/i.test(b.textContent||''))b.style.display='none'});['teacher','teacherLogin','pupilManager','rosterEditor','teacherBackBtn'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='none'});if(typeof window.show==='function')window.show('login');}else if(q.get('teacher')==='1'){var hasTeacher=sessionStorage.getItem('basa_cloud_role')==='teacher'||sessionStorage.getItem('basa_teacher_token')||localStorage.getItem('basa_teacher_token');if(hasTeacher){if(typeof window.show==='function')window.show('teacher')}else if(typeof window.basaCloudTeacherGate==='function'){window.basaCloudTeacherGate();}else{setTimeout(route,100);}}}catch(e){console.warn(e)}}route();};document.body.appendChild(p)};document.body.appendChild(s);}else{setTimeout(load,50);}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',load)}else{load()}})();</script>`;
    patched=patched.replace(/<\/body>/i,bootstrap+'</body>');
  }
  return new Response(patched,{headers:{...Object.fromEntries(response.headers.entries()),"content-type":"text/html; charset=utf-8"},status:response.status,statusText:response.statusText});
}
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()})
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const doc=e.request.destination==='document'||(e.request.headers.get('accept')||'').includes('text/html');if(doc){e.respondWith(fetch(e.request).then(r=>patchDocument(r.clone(),e.request)).catch(()=>caches.match(e.request)));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(x=>x.put(e.request,cp));return r})))})
