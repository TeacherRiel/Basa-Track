(function(){'use strict';
  if(window.__BASA_TRACK_FIXES_V22__) return;
  window.__BASA_TRACK_FIXES_V22__=true;
  const online=location.hostname.includes('github.io');
  if(!online) return;

  function cloudRole(){return sessionStorage.getItem('basa_cloud_role')||localStorage.getItem('basa_teacher_role')||'';}
  function cloudLearner(){return sessionStorage.getItem('basa_cloud_learner')||'';}
  function stateMap(){try{return JSON.parse(localStorage.getItem('BASA_TRACK_COMBINED_V2')||'{}')}catch(e){return {}}}
  function saveMap(m){localStorage.setItem('BASA_TRACK_COMBINED_V2',JSON.stringify(m));}
  function normalizeLearnerState(){
    const id=cloudLearner(); if(!id) return;
    const m=stateMap(), s=m[id]; if(!s) return;
    s.mar=s.mar||{}; s.cl=s.cl||{}; s.pg=s.pg||{};
    s.mar.done=Array.isArray(s.mar.done)?s.mar.done:[];
    s.mar.validated=Number(s.mar.validated)||0;
    s.mar.pending=!!s.mar.pending;
    s.mar.approved=!!s.mar.approved;
    s.cl.validated=Number(s.cl.validated)||0;
    s.cl.cp=Math.max(1,Number(s.cl.cp)||1);
    s.cl.pi=Math.max(0,Number(s.cl.pi)||0);
    s.cl.pending=!!s.cl.pending;
    s.cl.review=!!s.cl.review;
    s.cl.screen=s.cl.screen||'cover';
    s.pg.validated=Number(s.pg.validated)||0;
    s.pg.cp=Math.max(1,Number(s.pg.cp)||1);
    s.pg.pi=Math.max(0,Number(s.pg.pi)||0);
    saveMap(m);
  }

  function installClaveriaFix(){
    if(cloudRole()!=='learner' || typeof window.openCl!=='function') return false;
    if(window.openCl.__basaWrappedV22) return true;
    const orig=window.openCl;
    function wrapped(){
      normalizeLearnerState();
      try{return orig.apply(this,arguments);}catch(e){
        console.warn('BASA Claveria repair:',e);
        try{
          const id=cloudLearner(),m=stateMap(),s=m[id]&&m[id].cl;
          if(id&&s){s.cp=Math.max(1,Number(s.cp)||1);s.pi=0;s.screen='cover';s.pending=false;saveMap(m);}
          if(typeof window.renderCl==='function') return window.renderCl();
        }catch(x){console.warn('BASA Claveria fallback:',x)}
      }
    }
    wrapped.__basaWrappedV22=true;
    window.openCl=wrapped;
    return true;
  }

  function installTeacherFix(){
    if(typeof window.show==='function' && !window.show.__basaTeacherWrappedV22){
      const origShow=window.show;
      function showWrapped(id){
        const r=origShow.apply(this,arguments);
        if(id==='learner' && cloudRole()==='teacher') setTimeout(function(){
          let b=document.getElementById('basaTeacherReturn');
          if(!b){
            b=document.createElement('button'); b.id='basaTeacherReturn'; b.type='button';
            b.textContent='← Back to Teacher Dashboard';
            b.style.cssText='position:fixed;top:12px;left:12px;z-index:100000;background:#315c8c;color:#fff;border:0;border-radius:10px;padding:10px 14px;font:700 14px Arial,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.18);cursor:pointer';
            b.onclick=function(){if(typeof window.show==='function')window.show('teacher');if(typeof window.basaCloudRefreshTeacher==='function')setTimeout(window.basaCloudRefreshTeacher,250)};
            document.body.appendChild(b);
          }
          b.style.display='block';
        },100);
        if(id==='teacher'){const b=document.getElementById('basaTeacherReturn');if(b)b.style.display='none';}
        return r;
      }
      showWrapped.__basaTeacherWrappedV22=true;
      window.show=showWrapped;
    }
  }

  function boot(){installClaveriaFix();installTeacherFix();}
  const timer=setInterval(function(){
    boot();
    if((cloudRole()==='learner' && typeof window.openCl==='function') || (cloudRole()==='teacher' && typeof window.show==='function')) clearInterval(timer);
  },100);
  setTimeout(function(){clearInterval(timer);boot()},8000);
})();
