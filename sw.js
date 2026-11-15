/* Service worker: lets the app open without signal and keeps everyone on the latest version. */
const V='2026.11.14.1945', CORE='core-'+V, RT='runtime-v1';
const SHELL=['./','manifest.webmanifest','icon-192.png','icon-512.png','icon-180.png'];
const LIBS=['https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install',e=>{e.waitUntil(Promise.all([caches.open(CORE).then(c=>c.addAll(SHELL)),caches.open(RT).then(c=>Promise.all(LIBS.map(u=>c.match(u).then(m=>m||c.add(u).catch(()=>{})))))]).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('core-')&&k!==CORE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(u.origin===location.origin){
    /* the app itself: newest copy when online, saved copy when not */
    e.respondWith(fetch(r).then(res=>{ if(res.ok){const cp=res.clone();caches.open(CORE).then(c=>c.put(r,cp))} return res }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('./'))));
  } else if(/(^|\.)cdnjs\.cloudflare\.com$|(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/.test(u.hostname)){
    /* libraries and fonts never change: saved copy first */
    e.respondWith(caches.open(RT).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res }))));
  }
});