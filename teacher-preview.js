(function(){'use strict';
if(window.__BASA_TEACHER_PREVIEW__) return;window.__BASA_TEACHER_PREVIEW__=true;
if(!location.hostname.includes('github.io')) return;
let preview=false,allowPupilLogin=false;
function teacherToken(){return sessionStorage.getItem('basa_cloud_token')||sessionStorage.getItem('basa_teacher_token')||localStorage.getItem('basa_teacher_token')||'';}
function isTeacher(){return !!sessionStorage.getItem('basa_teacher_token')||!!localStorage.getItem('basa_teacher_token')||sessionStorage.getItem('basa_cloud_role')==='teacher';}
function saveTeacherSession(){const t=teacherToken();if(!t)return;sessionStorage.setItem('basa_teacher_token',t);sessionStorage.setItem('basa_teacher_role','teacher');localStorage.setItem('basa_teacher_token',t);localStorage.setItem('basa_teacher_role','teacher');}
function restoreTeacherSession(){const t=teacherToken();if(!t)return false;sessionStorage.setItem('basa_cloud_token',t);sessionStorage.setItem('basa_cloud_role','teacher');sessionStorage.setItem('basa_teacher_token',t);sessionStorage.setItem('basa_teacher_role','teacher');sessionStorage.removeItem('basa_cloud_learner');localStorage.setItem('basa_teacher_token',t);localStorage.setItem('basa_teacher_role','teacher');return true;}
function clearPreview(){preview=false;allowPupilLogin=false;sessionStorage.removeItem('basa_teacher_preview');sessionStorage.removeItem('basa_preview_learner');localStorage.removeItem('basa_teacher_preview');localStorage.removeItem('basa_preview_learner');}
function markPreview(id){if(!isTeacher())return;saveTeacherSession();preview=true;allowPupilLogin=true;sessionStorage.setItem('basa_teacher_preview','1');sessionStorage.setItem('basa_preview_learner',String(id||''));localStorage.setItem('basa_teacher_preview','1');localStorage.setItem('basa_preview_learner',String(id||''));showReturnButton();}
function goTeacher(){saveTeacherSession();clearPreview();const url='/Basa-Track/online-app/BASA_TRACK_PRESENTATION_READY.html?teacher=1';location.href=url;}
function showReturnButton(){if(!preview&&!sessionStorage.getItem('basa_teacher_preview')&&!localStorage.getItem('basa_teacher_preview'))return;let b=document.getElementById('basaTeacherPreviewReturn');if(!b){b=document.createElement('button');b.id='basaTeacherPreviewReturn';b.type='button';b.textContent='← Teacher Dashboard';b.style.cssText='position:fixed;top:12px;left:12px;z-index:2147483647;background:#315c8c;color:#fff;border:0;border-radius:10px;padding:10px 14px;font:700 14px Arial,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer';b.onclick=function(){goTeacher()};document.body.appendChild(b)}b.style.display='block';}
function hookOpen(){const originalOpen=window.openPupilAccount;if(typeof originalOpen!=='function'||originalOpen.__basaTeacherWrapped)return false;function wrappedOpen(id){markPreview(id);const r=originalOpen.apply(this,arguments);setTimeout(showReturnButton,250);return r;}wrappedOpen.__basaTeacherWrapped=true;window.openPupilAccount=wrappedOpen;return true;}
function hookWhenReady(){if(hookOpen())return;setTimeout(hookWhenReady,100);}
hookWhenReady();
const originalLogin=window.login;
if(typeof originalLogin==='function'){
  window.login=async function(){
    if(isTeacher()){
      saveTeacherSession();
      if(!preview){preview=true;allowPupilLogin=true;sessionStorage.setItem('basa_teacher_preview','1');localStorage.setItem('basa_teacher_preview','1');}
    }
    const r=await originalLogin.apply(this,arguments);
    setTimeout(showReturnButton,150);
    return r;
  };
}
const originalShow=window.show;
if(typeof originalShow==='function'){
  window.show=function(id){
    const marked=preview||sessionStorage.getItem('basa_teacher_preview')==='1'||localStorage.getItem('basa_teacher_preview')==='1';
    if(marked&&id==='login'&&allowPupilLogin){allowPupilLogin=false;const r=originalShow.apply(this,arguments);setTimeout(showReturnButton,100);return r;}
    if(marked&&(id==='home'||id==='login')){goTeacher();return;}
    const r=originalShow.apply(this,arguments);if(marked)setTimeout(showReturnButton,100);return r;
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
window.addEventListener('load',()=>{if(sessionStorage.getItem('basa_teacher_preview')==='1'||localStorage.getItem('basa_teacher_preview')==='1')preview=true;saveTeacherSession();hookWhenReady();setTimeout(showReturnButton,300);});
})();