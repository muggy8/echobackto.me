const absoluteAssetRegex=/^(https?:)?\//,cacheName="assets";async function installAssets(){const e=await caches.open(cacheName),t=await fetch("assets.json").then(e=>e.json());let s=[];for(let n in t){let i=absoluteAssetRegex.test(n)?n:"/"+n,r=t[n];var a=e.match(i).then(async function(t){if(t&&t.headers.get("X-version")===r)return t;let s=await fetch(i),a=await s.text(),n={};for(let e of s.headers.entries())n[e[0]]=e[1];n["X-version"]=r;let c=new Response(a,{status:s.status,statusText:s.statusText,headers:n,redirected:s.redirected,ok:s.ok});e.put(i,c)});s.push(a)}return console.log("assets updated"),installAssets.ready=Promise.all(s)}installAssets.ready=Promise.resolve(),self.addEventListener("install",function(e){e.waitUntil(installAssets())}),self.addEventListener("fetch",function(e){"navigate"===e.request.mode?(installAssets(),e.respondWith(caches.open(cacheName).then(t=>t.match(e.request)))):e.respondWith(installAssets.ready.then(async()=>{let t=await caches.open(cacheName),s=await t.match(e.request);if(s)return s;{let s=await fetch(e.request);return await t.put(e.request,s.clone()),s}}))});