App.Components.Recorder = (function({div, label, button}){
	return class extends React.Component {
		constructor(prop){
			super(prop)
			var context = this
			context.sate = prop.state

			if (!Recorder.isRecordingSupported()) {
				alert("browser not supported");
				return;
			}

			var recorder = context.recorder = new Recorder({
				encoderApplication: 2048,
				numberOfChannels: 1,
				encoderPath: "https://github.com/chris-rudmin/opus-recorder/blob/master/dist/encoderWorker.min.js"
			})

			recorder.addEventListener("start", function(){
				context.setState({recording: true})
			})

			recorder.addEventListener("stop", function(){
				context.setState({recording: false})
			})

			recorder.addEventListener("dataavailable", context.receivedNewRecording.bind(context))
		}

		render(){
			return div({className: "content"},
				button(this.state.recording ? "stop" : "start")
			)
		}

		receivedNewRecording(event){
			console.log(this)
		}
	}
})(REP)
