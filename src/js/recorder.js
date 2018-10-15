App.Components.Recorder = (function({div, label, button}){
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
				encoderPath: "deps/opus-recorder/encoderWorker.min.js"
			})

			// recorder.onstart = function(){
			// 	console.log("start")
			// 	context.setState({recording: true})
			// }

			recorder.onstart = context.startRecording.bind(context)

			recorder.onstop = function(){
				console.log("stop")
				context.setState({recording: false})
			}

			recorder.ondataavailable =			context.receivedNewRecording.bind(context)

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

		}

		receivedNewRecording(event){
			console.log(this, event)
		}
	}
})(REP)
