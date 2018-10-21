var autoRecorder = (function(){
	var recorderProto = {
		workerPath: "ogg_encoder_worker.js",
		stopItteration: 10,
		end: function(){
			if (context.recordState === "end"){
				return
			}
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
			context.recordState = "end"
		},
		onRecording: function(){

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
		context.setAvarage = setAvarage.bind(context)
		theActualOutput.monitorForRecording = monitorForRecording.bind(theActualOutput)
		theActualOutput.recordState = "standby"
		theActualOutput.offIterations = 0


		initializeAvarageFinder: {

			if (context.lAvgDiff && context.rAvgDiff){
				break initializeAvarageFinder
			}

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
		}

		return navigator.mediaDevices
			.getUserMedia({ audio: true, video: false })
			.then(function(stream){
				context.stream = stream
				context.audioContext = new AudioContext(stream)
				context.source = context.audioContext.createMediaStreamSource(stream)
    			context.processor = context.audioContext.createScriptProcessor(4096, 2, 2)
				context.source.connect(context.processor)
				context.processor.connect(context.audioContext.destination)

				if (context.lAvgDiff && context.rAvgDiff){
					return
				}

				context.processor.addEventListener("audioprocess", context.monitorAmbiant)
				return delay(3000)
			}).then(function(){
				context.processor.removeEventListener("audioprocess", context.monitorAmbiant)

				resolveAvgDiff: {
					if (context.lAvgDiff && context.rAvgDiff){
						break resolveAvgDiff
					}

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
				}

				context.processor.addEventListener("audioprocess", theActualOutput.monitorForRecording)
				context.worker.onmessage = function(e){
					theActualOutput.onRecording(e.data)
				}
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

				// init the worker logic
				context.worker.postMessage({
					cmd: "init",
					sampleRate: context.audioContext.sampleRate
				})

				// we want to init this tick too so we'll send it to the worker as well
				context.worker.postMessage({
					cmd: 'write',
					leftData: e.inputBuffer.getChannelData(0),
					rightData: e.inputBuffer.getChannelData(1),
					samplesCount: e.inputBuffer.getChannelData(0).length
				})
			}
		}
		else if (context.recordState === "recording"){
			// if it's recording we need to send the data to the worker first always
			context.worker.postMessage({
				cmd: 'write',
				leftData: e.inputBuffer.getChannelData(0),
				rightData: e.inputBuffer.getChannelData(1),
				samplesCount: e.inputBuffer.getChannelData(0).length
			})

			if (lAvgDiff <= context.lAvgDiff && rAvgDiff <= context.rAvgDiff){
				if (context.offIterations < context.stopItteration){
					context.offIterations ++
				} else {
					context.offIterations = 0
					context.recordState = "standby"
					console.log("stoped")

					// alright it's all done lets end it
					context.worker.postMessage({cmd: 'finish'});
				}
			} else if (lAvgDiff > context.lAvgDiff || rAvgDiff > context.rAvgDiff){
				context.offIterations = 0
			}
		}
	}

	function setAvarage(l, r){
		l && (this.lAvgDiff = l)
		r && (this.rAvgDiff = r)
	}
})()
