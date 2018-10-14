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

			var recorder = context.recorder = new Recorder({
				encoderApplication: 2048,
				numberOfChannels: 1,
				encoderPath: "https://unpkg.com/opus-recorder@5.0.0/dist/encoderWorker.min.js"
			})

			console.log(recorder)

			recorder.onstart = function(){
				context.setState({recording: true})
				console.log("start")
			}

			recorder.onstop = function(){
				context.setState({recording: false})
				console.log("stop")
			}

			recorder.ondataavailable = context.receivedNewRecording.bind(context)
		}

		render(){
			return div({className: "content"},
				button({onClick: ()=>{
					this.state.recording ? this.recorder.stop() : this.recorder.start()
				}},
					this.state.recording ? "stop" : "start"
				)
			)
		}

		receivedNewRecording(event){
			console.log(this)
		}
	}
})(REP)
