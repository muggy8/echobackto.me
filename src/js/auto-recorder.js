var autoRecorder = (function(){
	var recorderProto = {
		workerPath: "ogg_encoder_worker.js",
		monitorAmbiant: function(e){
			console.log(e)
		},
		end: function(){
			this.processor.disconnect()
			this.source.disconnect()
			this.audioContext.close()
			try{
				this.stream.stop()
			}
			catch(uwu){
				this.stream.getTracks().forEach(function(track){
					track.stop()
				})
			}
			this.worker.terminate()
		}
	}
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	function delay(ms){
		return new Promise(function(accept){
			setTimeout(accept, ms)
		})
	}

	return function(configs = {}){
		var context = Object.create(recorderProto)
		Object.assign(context, configs)
		context.worker = new Worker(context.workerPath)
		context.monitorAmbiant = recorderProto.monitorAmbiant.bind(context)

		return navigator.mediaDevices
			.getUserMedia({ audio: true, video: false })
			.then(function(stream){
				context.stream = stream
				context.audioContext = new AudioContext(stream)
				context.source = context.audioContext.createMediaStreamSource(stream)
    			context.processor = context.audioContext.createScriptProcessor(4096, 2, 2)

				context.processor.addEventListener("audioprocess", context.monitorAmbiant)
				return delay(3000)
			}).then(function(){
				context.processor.removeEventListener("audioprocess", context.monitorAmbiant)
				context.end()
				return context
			})

		return new Promise(function(accept, reject){


			// context.audioContext = new AudioContext()
			// context.monitorAmbiant = recorderProto.monitorAmbiant.bind(context)
			//
			// context.worker.addEventListener("audioprocess", context.monitorAmbiant)
			// delay(3000).then(function(){
			// 	context.worker.removeEventListener("audioprocess", context.monitorAmbiant)
			// 	accept(context)
			// })
		})
	}
})()
