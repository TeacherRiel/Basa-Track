(function(){'use strict';
if(window.__BASA_TEACHER_PREVIEW__) return;window.__BASA_TEACHER_PREVIEW__=true;
if(!location.hostname.includes('github.io')) return;
let preview=false;
function isTeacher(){return sessionStorage.getItem('basa_cloud_role')==='teacher' || sessionStorage.getItem('basa_teacher_token');}
function saveTeacherSession(){if(sessionStorage.getItem('basa_cloud_role')==='teacher'){sessionStorage.setItem('basa_teacher_token',sessionStorage.getItem('basa_cloud_token')||'');sessionStorage.setItem('basa_teacher_role','teacher');}}
function restoreTeacherSession(){const t=sessionStorage.getItem('basa_teacher_token');if(t){sessionStorage.setItem('basa_cloud_token',t);sessionStorage.setItem('basa_cloud_role','teacher');sessionStorage.removeItem('basa_cloud_learner');return true}return false;}
const originalOpen=window.openPupilAccount;
if(typeof originalOpen==='function'){
  window.openPupilAccount=function(id){
    if(isTeacher()){
      preview=true;sessionStorage.setItem('basa_teacher_preview','1');sessionStorage.setItem('basa_preview_learner',String(id||''));saveTeacherSession();
    }
    const r=originalOpen.apply(this,arguments);
    setTimeout(()=>{if(preview&&isTeacher()){
      let b=document.getElementById('basaTeacherReturn');
      if(b)b.style.display='block';
    }},300);
    return r;
  };
}
const originalShow=window.show;
if(typeof originalShow==='function'){
  window.show=function(id){
    if(preview && isTeacher() && (id==='home'||id==='login')){
      restoreTeacherSession();
      preview=false;sessionStorage.removeItem('basa_teacher_preview');sessionStorage.removeItem('basa_preview_learner');
      const r=originalShow.apply(this,['teacher']);
      if(typeof window.basaCloudRefreshTeacher==='function')setTimeout(window.basaCloudRefreshTeacher,250);
      return r;
    }
    return originalShow.apply(this,arguments);
  };
}
const originalLogout=window.logout;
if(typeof originalLogout==='function'){
  window.logout=function(){
    const wasPreview=preview || sessionStorage.getItem('basa_teacher_preview')==='1';
    if(wasPreview && isTeacher()){
      saveTeacherSession();
      try{originalLogout.apply(this,arguments)}catch(e){}
      restoreTeacherSession();
      preview=false;sessionStorage.removeItem('basa_teacher_preview');sessionStorage.removeItem('basa_preview_learner');
      setTimeout(()=>{if(typeof window.show==='function')window.show('teacher');else location.href='/Basa-Track/online-app/BASA_TRACK_PRESENTATION_READY.html?teacher=1';},50);
      return;
    }
    return originalLogout.apply(this,arguments);
  };
}
window.addEventListener('load',()=>{
  if(sessionStorage.getItem('basa_teacher_preview')==='1'&&isTeacher())preview=true;
});
})();