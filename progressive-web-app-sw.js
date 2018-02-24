var staticAssettContainerName = "static-files";

self.addEventListener("fetch", function(ev){
	// always try to fetch any request from the network and cache the result and only serve the cache if network is down
	ev.respondWith(
		caches.open(staticAssettContainerName).then(function(cache){
			return cache.match(ev.request).then(function(cacheRes){
				return fetch (ev.request).then(function(fetchRes){
					cache.put(ev.request, fetchRes.clone())
					return fetchRes || cacheRes;
				})
			})
		})
	)
})
