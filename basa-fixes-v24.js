(function(){'use strict';
  if(window.__BASA_TRACK_FIXES_V24__) return;
  window.__BASA_TRACK_FIXES_V24__=true;
  if(!location.hostname.includes('github.io')) return;

  function isLearner(){return (sessionStorage.getItem('basa_cloud_role')||'')==='learner';}
  function map(){try{return JSON.parse(localStorage.getItem('BASA_TRACK_COMBINED_V2')||'{}')}catch(e){return {}}}
  function put(m){localStorage.setItem('BASA_TRACK_COMBINED_V2',JSON.stringify(m));}
  function learnerId(){return sessionStorage.getItem('basa_cloud_learner')||'';}

  function installNavigationFix(){
    if(window.__BASA_NAVIGATION_FIX_V24__) return;
    window.__BASA_NAVIGATION_FIX_V24__=true;
    document.addEventListener('click',function(e){
      if(!isLearner()) return;
      const b=e.target&&e.target.closest?e.target.closest('#activity button'):null;
      if(!b) return;
      const text=(b.textContent||'').replace(/\s+/g,' ').trim();
      try{
        if(/PREVIOUS/i.test(text)){
          e.preventDefault(); e.stopImmediatePropagation();
          const m=map(),id=learnerId(),s=m[id];
          if(!s) return;
          if(window.mode==='cl' || /Claveria/i.test(document.getElementById('activity')?.textContent||'')){
            s.cl=s.cl||{}; s.cl.pi=Math.max(0,Number(s.cl.pi)||0);
            if(s.cl.pi>0){s.cl.pi--;put(m);if(typeof window.renderCl==='function')window.renderCl();}
          }else if(window.mode==='pg' || /Pagbasa sa Filipino/i.test(document.getElementById('activity')?.textContent||'')){
            s.pg=s.pg||{}; s.pg.pi=Math.max(0,Number(s.pg.pi)||0);
            if(s.pg.pi>0){s.pg.pi--;put(m);if(typeof window.renderPg==='function')window.renderPg();}
          }
          return;
        }
        if(/Reading Materials|Balik sa Marungko|←/i.test(text)){
          if(/Reading Materials|Balik sa Marungko/i.test(text)){
            e.preventDefault(); e.stopImmediatePropagation();
            if(/Balik sa Marungko/i.test(text) && typeof window.openMar==='function') window.openMar();
            else if(typeof window.learnerHome==='function') window.learnerHome();
          }
        }
      }catch(err){console.warn('BASA navigation repair:',err)}
    },true);
  }

  function boot(){installNavigationFix();}
  const timer=setInterval(function(){boot();if(document.body)clearInterval(timer)},100);
  setTimeout(function(){clearInterval(timer);boot()},10000);
})();