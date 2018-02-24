var cacheName = "general-cache"
var statics = [
	"",
	"/",
	"/js/",
	"/js/recorder/waveWorker.min.js",
	"/js/recorder/recorder.min.js",
	"/js/recorder/encoderWorker.min.js",
	"/js/recorder/decoderWorker.min.js",
	"/css/styles.css"
]

self.addEventListener("install", function(ev){
	ev.waitUntil( //precache so next time we can use it if we happen to be offline next time
		caches.open(cacheName).then(function(cache){
			cache.addAll(statics)
		})
	)
})

self.addEventListener("fetch", function(ev){
	// always try to fetch any request from the network and cache the result and only serve the cache if network is down
	ev.respondWith(
		caches.open(cacheName).then(function(cache){
			return caches.match(ev.request).then(function(cacheRes){
				if (cacheRes){
					var cacheResExpired = cacheRes.headers.get("expires")
						? Date.now() >=  new Date(cacheRes.headers.get("expires")).getTime()
						: false
					if (!cacheResExpired){
						return cacheRes
					}
				}
				return fetch(ev.request).then(function(fetchRes){
					var isDataUrl = fetchRes.url.match(/^data:/)
					var hasNoCacheHeader = fetchRes.headers.get("cache-control") && fetchRes.headers.get("cache-control").match(/no(-|\s)cache/i)
					var networkFailure = fetchRes && fetchRes.status >= 200 && fetchRes.status < 300
					var hasExpireDate = fetchRes.headers.get("expires")

					if (!isDataUrl && !hasNoCacheHeader && !networkFailure && hasExpireDate){
						cache.put(ev.request, fetchRes.clone())
					}
					return networkFailure ? cacheRes : fetchRes
				})
			})

		})
	)
})
