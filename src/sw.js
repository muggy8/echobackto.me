const absoluteAssetRegex = /^(https?:)?\//
const cacheName = "assets"

async function installAssets(){
	const storage = await caches.open(cacheName)
	const assetList = await fetch("assets.json").then(res=>res.json())
	let requests = []

	// loop over all assets that were received and create a cache if need be
	for(let key in assetList){
		let url = absoluteAssetRegex.test(key) ? key : "/" + key
		let version = assetList[key]

		var request = storage.match(url) // do not use async await here cuz it's inside a for loop which we dont want to pause so the requests can run concurently
			.then(async function(cachedAsset){ // we can use async await here cuz this is in a callback so we can do whatever since the primary request has been initiated already
				if (cachedAsset && cachedAsset.headers.get("X-version") === version){return cachedAsset}

				let remoteAsset = await fetch(url)

				// because the responce is immuteable, we will create a clone of the responce and a version header to it
				let remoteAssetText = await remoteAsset.text()
				let copiedHeaders = {}
				for(let pair of remoteAsset.headers.entries()){
					copiedHeaders[pair[0]] = pair[1]
				}
				copiedHeaders["X-version"] = version

				let cachableResponce = new Response(remoteAssetText, {
					status: remoteAsset.status,
					statusText: remoteAsset.statusText,
					headers: copiedHeaders,
					redirected: remoteAsset.redirected,
					ok: remoteAsset.ok,
				})
				storage.put(url, cachableResponce)
			})

		requests.push(request)
	}
	return installAssets.ready = Promise.all(requests)
}
installAssets.ready = Promise.resolve()

self.addEventListener("install", function(ev){
	ev.waitUntil(installAssets())
})

self.addEventListener("fetch", function(ev){
	if (ev.request.mode === "navigate"){
		installAssets()
		ev.respondWith(
			caches.open(cacheName)
				.then(storage=>storage.match(ev.request))
		)
	}
	else{
		ev.respondWith(
			installAssets.ready
				.then(async ()=>{
					let storage = await caches.open(cacheName)
					let cachedAsset = await storage.match(ev.request)

					if (cachedAsset){
						return cachedAsset
					}
					else{
						let res = await fetch(ev.request)
						await storage.put(ev.request, res.clone())
						return res
					}
				})
		)
	}
})
