const CACHE='cap-lead-v3';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // réseau d'abord pour la page (mises à jour), cache sinon
    if(req.mode==='navigate'){ e.respondWith(fetch(req).then(r=>{const cp=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return r;}).catch(()=>caches.match('./index.html'))); return; }
    e.respondWith(caches.match(req).then(r=>r||fetch(req))); return;
  }
  if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.open(CACHE).then(c=>c.match(req).then(hit=>hit||fetch(req).then(r=>{c.put(req,r.clone());return r;}))));
  }
});
