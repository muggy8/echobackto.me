const absoluteAssetRegex=/^(https?:)?\//,cacheName="assets";async function installAssets(){const e=await caches.open(cacheName),t=await fetch("/assets.json"),s=await t.clone().json().catch(()=>({})),a=await e.match("/assets.json").then(e=>e?e.json():{});let n={};for(let e in s)a[e]!==s[e]&&(n[e]=s[e]);let l=[];for(let t in n){let s=fetchAndStoreRequest(absoluteAssetRegex.test(t)?t:"/"+t,e);l.push(s)}let o=[];for(let e in a)if(!s.hasOwnProperty(e)){let t=absoluteAssetRegex.test(e)?e:"/"+e;o.push(t)}for(let t of o){let s=e.delete(t);l.push(s)}return l.push(e.put("/assets.json",t)),installAssets.ready=Promise.all(l)}async function fetchAndStoreRequest(e,t){let s=await fetch(e);return await t.put(e,s.clone()),s}installAssets.ready=Promise.resolve(),self.addEventListener("install",function(e){e.waitUntil(installAssets())}),self.addEventListener("fetch",function(e){"navigate"===e.request.mode&&installAssets(),e.respondWith(installAssets.ready.then(async()=>{let t=await caches.open(cacheName),s=await t.match(e.request);return s||fetchAndStoreRequest(e.request,t)}))});