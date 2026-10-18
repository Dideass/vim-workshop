export {};
// The isolation worker can become active before its updatefound listener is
// attached. Wait for control explicitly, so the first visit never starts Vim
// without SharedArrayBuffer and then sits on a failed editor.
async function prepareIsolation(){
 if(crossOriginIsolated||!isSecureContext||!('serviceWorker' in navigator))return;
 const key='vim-workshop.isolation-reload';
 let requested=false;
 const reload=()=>{
  if(requested||crossOriginIsolated||!navigator.serviceWorker.controller)return;
  try{if(sessionStorage.getItem(key)==='1')return;sessionStorage.setItem(key,'1');}catch{/* Reload still works when session storage is unavailable. */}
  requested=true;location.reload();
 };
 navigator.serviceWorker.addEventListener('controllerchange',reload);
 void navigator.serviceWorker.ready.then(reload).catch(()=>{});
 reload();
 await new Promise(resolve=>setTimeout(resolve,10000));
 navigator.serviceWorker.removeEventListener('controllerchange',reload);
}
await prepareIsolation();
if(crossOriginIsolated){try{sessionStorage.removeItem('vim-workshop.isolation-reload');}catch{/* No persistent preference depends on this marker. */}}
await import('./main');
