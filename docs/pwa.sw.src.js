/*
	The goal of this service worker is to cache all assets but each time the user navigates to somewhere else (namely open or refresh the app) the service worker will fetch the current version of the app's assets list which is built by the gulp process and then cache them for offline use. when the app is being called, it would effectively use a strategy of cache first and fall back to network if asset not found in cache
*/


const absoluteAssetRegex = /^(https?:)?\//
const cacheName = "assets"

async function installAssets(){
	const storage = await caches.open(cacheName)
	const remoteAssetListRes = await fetch("/assets.json")
	const remoteAssetList = await remoteAssetListRes.clone().json().catch(()=>{return {}})
	const cachedAssetList = await storage.match("/assets.json").then(res=>res ? res.json() : {})

	// lets find out which paths we need to update
	let updateList = {}
	for(let key in remoteAssetList){
		if (cachedAssetList[key] !== remoteAssetList[key]){
			updateList[key] = remoteAssetList[key]
		}
	}
	let requests = []

	// loop over all assets that needs to be updated and update them
	for(let key in updateList){
		let url = absoluteAssetRegex.test(key) ? key : "/" + key
		let request = fetchAndStoreRequest(url, storage)
		requests.push(request)
	}

	let toDelete = []
	for(let key in cachedAssetList){
		if (!remoteAssetList.hasOwnProperty(key)){
			let url = absoluteAssetRegex.test(key) ? key : ("/" + key)
			;toDelete.push(url)
		}
	}

	for(let url of toDelete){
		let deleteOpp = storage.delete(url)
		requests.push(deleteOpp)
	}

	requests.push(
		storage.put("/assets.json", remoteAssetListRes)
	)

	return installAssets.ready = Promise.all(requests)
}
installAssets.ready = Promise.resolve()

async function fetchAndStoreRequest(req, storage){
	let res = await fetch(req)
	await storage.put(req, res.clone())
	return res
}

self.addEventListener("install", function(ev){
	ev.waitUntil(installAssets())
})

self.addEventListener("fetch", function(ev){
	if (ev.request.mode === "navigate"){
		installAssets()
	}

	ev.respondWith(
		installAssets.ready
			.then(async ()=>{
				let storage = await caches.open(cacheName)
				let cachedAsset = await storage.match(ev.request)

				if (cachedAsset){
					return cachedAsset
				}
				else{
					return fetchAndStoreRequest(ev.request, storage)
				}
			})
	)
})
