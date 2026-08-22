const SOURCE = new URL('../BASA_TRACK_PRESENTATION_READY.html', self.location.href).href;
const ROSTER = `const CLASS_ROSTER=[
  ["G1-001","Ana Santos"],
  ["G1-002","Marco Reyes"],
  ["G1-003","Lea Cruz"],
  ["G1-004","Carlo Garcia"],
  ["G1-005","Mia Dela Cruz"]
];`;
const LEARNERS = `"learners":{
  "G1-001":{"name":"Ana Santos","pin":"1001"},
  "G1-002":{"name":"Marco Reyes","pin":"1002"},
  "G1-003":{"name":"Lea Cruz","pin":"1003"},
  "G1-004":{"name":"Carlo Garcia","pin":"1004"},
  "G1-005":{"name":"Mia Dela Cruz","pin":"1005"}
}`;
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.mode!=='navigate')return;
 const url=new URL(req.url);if(!url.pathname.endsWith('/BASA_TRACK_PRESENTATION_READY.html'))return;
 event.respondWith((async()=>{
  const upstream=await fetch(SOURCE,{cache:'no-store'});let html=await upstream.text();
  html=html.replaceAll('BASA_TRACK_ROSTER_V2','BASA_TRACK_DEMO_ROSTER_V1').replaceAll('BASA_TRACK_COMBINED_V2','BASA_TRACK_DEMO_DATA_V1').replaceAll('BASA_TRACK_COMBINED_V1','BASA_TRACK_DEMO_DATA_OLD_V1').replace(/const CLASS_ROSTER=\[.*?\];/s,ROSTER).replace(/"learners":\s*\{.*?\}\s*\}/s,LEARNERS);
  const role=url.searchParams.get('role'),learner=(url.searchParams.get('id')||'').trim().toUpperCase();
  const routeScript=`<script>window.addEventListener('load',function(){try{const role=${JSON.stringify(role)},learner=${JSON.stringify(learner)};if(role==='teacher'){show('teacher');document.querySelectorAll('#home button').forEach(function(b){b.style.display='none';});}else if(role==='learner'){const t=document.querySelector('#home button[onclick*="teacher"]');if(t)t.style.display='none';const sec=document.getElementById('teacher');if(sec)sec.style.display='none';show('login');const lid=document.getElementById('lid');if(lid&&learner)lid.value=learner;const back=document.querySelector('#login button.gray');if(back)back.style.display='none';}}catch(e){console.error(e)}});<\/script>`;
  html=html.replace('</body>',routeScript+'</body>');
  return new Response(html,{status:upstream.status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
 })());
});
