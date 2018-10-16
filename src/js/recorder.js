App.Components.Recorder = (function({div, label, button}){
	function arrayBufferToBase64(buffer) {
		var binary = '';
		var bytes = new Uint8Array( buffer );
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}

	return class extends React.Component {
		constructor(prop){
			super(prop)
			var context = this
			context.state = prop.state

			if (!Recorder.isRecordingSupported()) {
				alert("browser not supported");
				return;
			}

			if (prop.state.recorder){
				this.recorder = prop.state.recorder
				return
			}

			var recorder = this.recorder = new Recorder({
				encoderApplication: 2048,
				numberOfChannels: 1,
				encoderPath: "deps/opus-recorder/encoderWorker.min.js",
				// streamPages: true,
			})

			recorder.onstart = ()=>context.startRecording()

			recorder.onstop = ()=>context.setState({recording: false})

			recorder.ondataavailable = (data)=>context.stopRecording(data)

			prop.state.recorder = this.recorder // export recorder to the global state to be cached for the next iteration
		}

		componentWillUnmount(){
			this.recorder.stop()
		}

		render(){
			return div({className: "content"},
				button({onClick: ()=>{
					console.log(this)
					this.state.recording ? this.state.recorder.stop() : this.state.recorder.start()
				}},
					this.state.recording ? "Stop" : "Start"
				)
			)
		}

		// the event management stuff
		get startRecording(){
			return this.beginAmbiantSeek
		}

		beginAmbiantSeek(){
			// welp the first thing i'm gonna do is to setup the silly thing where we listen to the raw events cuz the thing is public in the library derp and secnd there's no other way :/
			this.recorder.scriptProcessorNode.addEventListener("audioprocess", (e)=>{this.receiveRawData(e)})

			// k now we record for 3 seconds
			this.setState({recording: true})
			setTimeout(()=>{
				this.recorder.stop()
			}, 3000)
		}

		beginSegmentRecording(){}

		get stopRecording(){
			return this.receiveAmbiantAvarage
		}

		receiveAmbiantAvarage(recordedSample){
			// console.log(recordedSample)
			// console.log(new Blob( [recordedSample], { type: 'audio/ogg' } ))

			// var distribution = {}
			// var greaterSum = recordedSample.forEach(function(bit){
			// 	distribution[bit] = distribution[bit] || 0
			// 	distribution[bit]++
			// })


			// this.setState({recorder: {avarage}})

			// console.log(distribution)

			// console.log("data:audio/ogg;base64," + arrayBufferToBase64(recordedSample))
		}

		receivedNewRecording(event){
			console.log(this, event)
		}

		get receiveRawData(){
			return this.trackAmbiant
		}

		trackAmbiant(e){
			console.log(e.inputBuffer.getChannelData(0))
		}
	}
})(REP)
