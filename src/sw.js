importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js')

const precacheController = new workbox.precaching.PrecacheController()
const rootAssetRegex = /^(https?:)?\//
function generatePrecacheObject(name, json){
	return {
		url: rootAssetRegex.test(name) ? name : ("/" + name),
		revision: json[name]
	}
}
function updatePrecacheController(){
	return updatePrecacheController.ready = fetch("/assets.json")
		.then(res=>res.json())
		.then(json=>Object.getOwnPropertyNames(json).map(name=>generatePrecacheObject(name, json)))
		.then(cacheMap=>precacheController.addToCacheList(cacheMap))
		.then(()=>precacheController.install())
		.then(()=>precacheController.activate())
		.then(()=>console.log(precacheController.getCachedUrls()))
}
updatePrecacheController.ready = Promise.resolve()

self.addEventListener("install", function(ev){
	ev.waitUntil(updatePrecacheController())
})
self.addEventListener("fetch", function(ev){
	if (ev.request.mode === "navigate"){
		updatePrecacheController()
		ev.respondWith(caches.match(ev.request))
	}
	else{
		ev.respondWith(
			updatePrecacheController.ready
				.then(async ()=>{
					const cachedAsset = await caches.match(ev.request)
					console.log(cachedAsset)

					if (cachedAsset) {
						return cachedAsset
					}
					else{
						const networkAsset = await fetch(ev.request)
						await caches.open(precacheController._cacheName)
						   .then(cache=>cache.put(ev.request, networkAsset.clone()))
						return networkAsset

					}
				})
		)
	}
})
