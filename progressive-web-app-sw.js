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

var shouldCleanCash;
self.addEventListener("fetch", function(ev){
	if (ev.request.url.match(/^https:\/\/[^\/]+\/?$/i)){
		shouldCleanCash = caches.open(cacheName).then(function(cache){
			// request for the base HTML. we go and fetch the current version from the network if possiable
			var versionReq = new Request("/version")
			var remoteVersionPromise = fetch(versionReq)
			var localVersionPromise = caches.match(versionReq)

			// This promise should resolve to something truthy or falsy for weather or not the cache should be dumped and refetched
			return  Promise.all([remoteVersionPromise, localVersionPromise]).then(function(versions){
				var remote = versions[0]
				var local = versions[1]

				console.log(versions)

				// if the remote failed to fetch we are running off the cache so lets not replace it
				if (remote.status >= 400 || remote.status < 200){
					return false;
				}
				// if there is no local version, cache this into local versions
				if (!local) {
					return cache.put(versionReq, remote) // this will resolve to undefined
				}

				return Promise.all([
					local.text(),
					remote.text()
				]).then(function(texts){
					if (texts[0] !== texts[1]){
						return true
					}
					return false
				})
			}).then(function(res){
				console.log(res)
				return res
			})
		})
	}
	ev.respondWith(
		caches.open(cacheName).then(function(cache){
			return caches.match(ev.request).then(function(cacheRes){
				// console.log("requesting", ev.request, "cache", cacheRes)
				if (cacheRes){
					var cacheResExpired = cacheRes.headers.get("expires")
						? Date.now() >=  new Date(cacheRes.headers.get("expires")).getTime()
						: false
					if (!cacheResExpired){
						return cacheRes
					}
				}
				return fetch(ev.request).then(function(fetchRes){
					// console.log("fetched from network", fetchRes);
					var isDataUrl = fetchRes.url.match(/^data:/)
					var hasNoCacheHeader = fetchRes.headers.get("cache-control") && fetchRes.headers.get("cache-control").match(/no(-|\s)cache/i)
					var networkFailure = fetchRes && fetchRes.status >= 200 && fetchRes.status < 300
					var hasExpireDate = fetchRes.headers.get("expires")

					if (!isDataUrl && !hasNoCacheHeader && !networkFailure && hasExpireDate){
						cache.put(ev.request, fetchRes.clone())
					}
					return fetchRes
				})
			})

		})
	)
})
