var autoRecorder = (function(){
	var recorderProto = {
		workerPath: "ogg_encoder_worker.js",
		stopItteration: 10,
		end: function(){
			var context = this
			context.processor.disconnect()
			context.source.disconnect()
			context.audioContext.close()
			try{
				context.stream.stop()
			}
			catch(uwu){
				context.stream.getTracks().forEach(function(track){
					track.stop()
				})
			}
			context.worker.terminate()
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
		var theActualOutput = Object.create(context)
		Object.assign(context, configs)
		context.worker = new Worker(context.workerPath)
		context.monitorAmbiant = monitorAmbiant.bind(context)
		theActualOutput.monitorForRecording = monitorForRecording.bind(theActualOutput)
		theActualOutput.recordState = "standby"
		theActualOutput.offIterations = 0

		context.lMaxSum = 0
		context.lMaxCount = 0
		context.lMinSum = 0
		context.lMinCount = 0
		context.lAvgDiff = undefined
		context.rMaxSum = 0
		context.rMaxCount = 0
		context.rMinSum = 0
		context.rMinCount = 0
		context.rAvgDiff = undefined

		return navigator.mediaDevices
			.getUserMedia({ audio: true, video: false })
			.then(function(stream){
				context.stream = stream
				context.audioContext = new AudioContext(stream)
				context.source = context.audioContext.createMediaStreamSource(stream)
    			context.processor = context.audioContext.createScriptProcessor(4096, 2, 2)
				context.source.connect(context.processor)
				context.processor.connect(context.audioContext.destination)

				context.processor.addEventListener("audioprocess", context.monitorAmbiant)
				return delay(3000)
			}).then(function(){
				context.processor.removeEventListener("audioprocess", context.monitorAmbiant)

				context.lAvgDiff = (context.lMaxSum/context.lMaxCount) - (context.lMinSum/context.lMinCount)
				context.rAvgDiff = (context.rMaxSum/context.rMaxCount) - (context.rMinSum/context.rMinCount)

				delete context.lMaxSum
				delete context.lMaxCount
				delete context.lMinSum
				delete context.lMinCount
				delete context.rMaxSum
				delete context.rMaxCount
				delete context.rMinSum
				delete context.rMinCount

				context.processor.addEventListener("audioprocess", theActualOutput.monitorForRecording)


				// context.end()
				return theActualOutput
			})
	}

	function monitorAmbiant(e){
		var context = this
		e.inputBuffer.getChannelData(0).forEach(function(tick){
			if (tick > 0){
				context.lMaxSum =+ tick
				context.lMaxCount++
			}
			else if (tick < 0){
				context.lMinSum += tick
				context.lMinCount ++
			}
		})
		e.inputBuffer.getChannelData(1).forEach(function(tick){
			if (tick > 0){
				context.rMaxSum =+ tick
				context.rMaxCount++
			}
			else if (tick < 0){
				context.rMinSum += tick
				context.rMinCount ++
			}
		})
	}

	function monitorForRecording(e){
		var context = this
		context.lMaxSum = 0
		context.lMaxCount = 0
		context.lMinSum = 0
		context.lMinCount = 0
		context.rMaxSum = 0
		context.rMaxCount = 0
		context.rMinSum = 0
		context.rMinCount = 0

		monitorAmbiant.call(context, e)

		var lAvgDiff = (context.lMaxSum/context.lMaxCount) - (context.lMinSum/context.lMinCount)
		var rAvgDiff = (context.rMaxSum/context.rMaxCount) - (context.rMinSum/context.rMinCount)

		if (context.recordState === "standby"){
			if (lAvgDiff > context.lAvgDiff * 1.5 && rAvgDiff > context.rAvgDiff * 1.5){
				context.recordState = "recording"
				console.log("recording")
			}
		}
		else if (context.recordState === "recording"){
			if (lAvgDiff <= context.lAvgDiff && rAvgDiff <= context.rAvgDiff){
				if (context.offIterations < context.stopItteration){
					context.offIterations ++
				} else {
					context.offIterations = 0
					context.recordState = "standby"
					console.log("stoped")
				}
			} else if (lAvgDiff > context.lAvgDiff || rAvgDiff > context.rAvgDiff){
				context.offIterations = 0
			}
		}


	}
})()
