/* Mesure — garde l'app sur le téléphone pour l'ouvrir sans réseau. Version 97eba69441 */
const CACHE='mesure-97eba69441';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  /* Page de l'app : réseau d'abord (pour recevoir les mises à jour), sinon la copie gardée */
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{const cp=res.clone(); caches.open(CACHE).then(c=>c.put('index.html',cp)); return res;}).catch(()=>caches.match('index.html').then(x=>x||caches.match('./'))));
    return;
  }
  /* Le reste (icônes, polices) : copie gardée d'abord */
  if(u.origin===location.origin||/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); return res;})));
  }
});
