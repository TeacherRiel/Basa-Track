(function(){'use strict';
if(window.__BASA_TEACHER_PREVIEW__) return;window.__BASA_TEACHER_PREVIEW__=true;
if(!location.hostname.includes('github.io')) return;
let preview=false,allowPupilLogin=false;
function teacherToken(){return sessionStorage.getItem('basa_cloud_token')||sessionStorage.getItem('basa_teacher_token')||localStorage.getItem('basa_teacher_token')||'';}
function isTeacher(){return sessionStorage.getItem('basa_cloud_role')==='teacher'||!!sessionStorage.getItem('basa_teacher_token')||!!localStorage.getItem('basa_teacher_token');}
function saveTeacherSession(){const t=teacherToken();if(t){sessionStorage.setItem('basa_teacher_token',t);sessionStorage.setItem('basa_teacher_role','teacher');localStorage.setItem('basa_teacher_token',t);localStorage.setItem('basa_teacher_role','teacher');}}
function restoreTeacherSession(){const t=teacherToken();if(!t)return false;sessionStorage.setItem('basa_cloud_token',t);sessionStorage.setItem('basa_cloud_role','teacher');sessionStorage.setItem('basa_teacher_token',t);sessionStorage.setItem('basa_teacher_role','teacher');sessionStorage.removeItem('basa_cloud_learner');localStorage.setItem('basa_teacher_token',t);localStorage.setItem('basa_teacher_role','teacher');return true;}
function clearPreview(){preview=false;allowPupilLogin=false;sessionStorage.removeItem('basa_teacher_preview');sessionStorage.removeItem('basa_preview_learner');localStorage.removeItem('basa_teacher_preview');localStorage.removeItem('basa_preview_learner');}
function markPreview(id){if(!isTeacher())return;saveTeacherSession();preview=true;allowPupilLogin=true;sessionStorage.setItem('basa_teacher_preview','1');sessionStorage.setItem('basa_preview_learner',String(id||''));localStorage.setItem('basa_teacher_preview','1');localStorage.setItem('basa_preview_learner',String(id||''));}
function goTeacher(){if(!restoreTeacherSession()) return; clearPreview(); const target='/Basa-Track/online-app/BASA_TRACK_PRESENTATION_READY.html?teacher=1&pv=16'; location.href=target;}
function hookOpen(){const originalOpen=window.openPupilAccount;if(typeof originalOpen!=='function'||originalOpen.__basaTeacherWrapped)return false;function wrappedOpen(id){markPreview(id);const r=originalOpen.apply(this,arguments);setTimeout(()=>{if(preview&&isTeacher()){const b=document.getElementById('basaTeacherReturn');if(b)b.style.display='block';}},300);return r;}wrappedOpen.__basaTeacherWrapped=true;window.openPupilAccount=wrappedOpen;return true;}
function hookWhenReady(){if(hookOpen())return;setTimeout(hookWhenReady,100);}
hookWhenReady();
const originalShow=window.show;
if(typeof originalShow==='function'){
  window.show=function(id){
    const marked=preview||sessionStorage.getItem('basa_teacher_preview')==='1'||localStorage.getItem('basa_teacher_preview')==='1';
    if(marked&&isTeacher()&&id==='login'&&allowPupilLogin){allowPupilLogin=false;return originalShow.apply(this,arguments);}
    if(marked&&isTeacher()&&(id==='home'||id==='login')){goTeacher();return;}
    return originalShow.apply(this,arguments);
  };
}
const originalLogout=window.logout;
if(typeof originalLogout==='function'){
  window.logout=function(){
    const wasPreview=preview||sessionStorage.getItem('basa_teacher_preview')==='1'||localStorage.getItem('basa_teacher_preview')==='1';
    if(wasPreview&&isTeacher()){goTeacher();return;}
    clearPreview();localStorage.removeItem('basa_teacher_token');localStorage.removeItem('basa_teacher_role');return originalLogout.apply(this,arguments);
  };
}
window.addEventListener('load',()=>{
  if(sessionStorage.getItem('basa_teacher_preview')==='1'||localStorage.getItem('basa_teacher_preview')==='1')preview=true;
  if(sessionStorage.getItem('basa_cloud_role')==='teacher')saveTeacherSession();
  hookWhenReady();
});
})();
