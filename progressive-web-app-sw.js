var staticAssets = [
	"/",
	"/js/",
	"/css/styles.css"
]
var staticAssettContainerName = "static-files";

self.addEventListener("install", function(ev){
	console.log("install event fired", ev)
	ev.waitUntil(
		caches.open(staticAssettContainerName).then(function(cache){
			return cache.addAll(staticAssets)
		}
	))
})

self.addEventListener("fetch", function(ev){
	ev.respondWith(
		caches.open(staticAssettContainerName).then(function(cache){
			return cache.match(ev.request).then(function(res){
				if (res){
					return res;
				}
				else {
					return fetch(ev.request).then(function(fetchRes){
						cache.put(ev.request, fetchRes.clone())
						return fetchRes
					})
				}
			})
		})
	)
})
