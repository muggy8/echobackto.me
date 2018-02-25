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
	// on the request to the index page we do the cache busting
	if (ev.request.url.match(/^https:\/\/[^\/]+\/?$/i)){
		// figure out if we should dump the cache
		var shouldCleanCash = caches.open(cacheName).then(function(cache){
			// request for the base HTML. we go and fetch the current version from the network if possiable
			var versionReq = new Request("/version")
			var remoteVersionPromise = fetch(versionReq).then(function(fetched){
				return fetched // pass through
			}, function(o3o){
				console.log(o3o)
				// network error but we dont really care here
				return
			})
			var localVersionPromise = caches.match(versionReq)

			// This promise should resolve to something truthy or falsy for weather or not the cache should be dumped and refetched
			return  Promise.all([remoteVersionPromise, localVersionPromise]).then(function(versions){
				var remote = versions[0]
				var local = versions[1]

				// if the remote failed to fetch we are running off the cache so lets not replace it
				if (!remote || remote.status >= 400 || remote.status < 200){
					return false;
				}
				// if there is no local version, cache this into local versions
				if (!local) {
					return cache.put(versionReq, remote.clone()) // this will resolve to undefined
				}

				return Promise.all([
					local.text(),
					remote.text()
				]).then(function(texts){
					if (texts[0] && texts[1] && texts[0] !== texts[1]){
						return true
					}
					return false
				})
			})
		})

		// based on if we should or shouldn't dump the cache, we respond accordingly
		ev.respondWith(shouldCleanCash.then(function(dumpCache){
			if (dumpCache){
				var cache
				return caches.delete(cacheName).then(function(){
					return caches.open(cacheName)
				}).then(function(newCache){
					cache = newCache
					return cache.addAll(statics)
				}).then(function(){
					return caches.match(ev.request)
				})
			}
			else{
				return caches.match(ev.request)
			}
		}))
	}
	// any requests to aything that's not the index, we do cache first with network fallback usage since any requests to the index page will result in dumping the cache if an update is requred and since requests to the index is always the first request, these can be safe to do cache first repsonding
	else {
		ev.respondWith(
			caches.open(cacheName).then(function(cache){
				return caches.match(ev.request).then(function(cacheRes){
					if (cacheRes){
						var expireDate = cacheRes.headers.get("expires") && new Date(cacheRes.headers.get("expires")).getTime()
						if (expireDate && expireDate < Date.now()){
							return cacheRes
						}
					}
					return fetch(ev.request).then(function(fetchRes){
						// console.log("fetched from network", fetchRes);
						var isDataUrl = fetchRes.url.match(/^data\:/i)
						var hasNoCacheHeader = fetchRes.headers.get("cache-control") && fetchRes.headers.get("cache-control").match(/no(-|\s)cache/i)
						var networkFailure = fetchRes && fetchRes.status >= 200 && fetchRes.status < 300

						if (!isDataUrl && !hasNoCacheHeader && !networkFailure){
							cache.put(ev.request, fetchRes.clone())
						}
						return fetchRes
					})
				})
			})
		)
	}
})
