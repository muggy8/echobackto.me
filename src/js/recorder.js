App.Components.Recorder = (function({div, label, button, input, span}){
	// private static stuff
	function arrayBufferToBase64(buffer) {
		var binary = '';
		var bytes = new Uint8Array( buffer );
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode( bytes[ i ] );
		}
		return window.btoa( binary );
	}

	var maxSum = 0
	var minSum = 0
	var maxCount = 0
	var minCount = 0
	var recorder =  new Recorder({
		encoderApplication: 2048,
		numberOfChannels: 1,
		encoderPath: "deps/opus-recorder/encoderWorker.min.js",
	})

	function nullFunction(){}

	// ok here's the actual class that does stuff :3
	return class extends React.Component {
		constructor(prop){
			super(prop)
			var context = this
			context.state = prop.state

			if (!Recorder.isRecordingSupported()) {
				alert("browser not supported");
				return;
			}

			recorder.onstart = ()=>context.recordingStarted()

			recorder.onstop = ()=>context.recordingStopped()

			recorder.ondataavailable = (data)=>context.dataReceived(data)
		}

		componentWillUnmount(){
			recorder.stop()
		}

		render(){
			var initiated = Object.prototype.hasOwnProperty.call(this.state, "ambDiff")
			return div({className: "content"},
				div(
					span("Ambiant Noise Level: "),
					input({
						value: this.state.newAmbDiff || this.state.ambDiff || "",
						type: "number",
						min: 0,
						max: 1,
						onChange: (ev)=>this.setState({newAmbDiff: ev.target.value}),
						disabled: !initiated ? "disabled" : undefined,
						placeholder: "???"
					}),
					initiated
						? button({onClick: ()=>this.setState({
							ambDiff: this.sate.newAmbDiff,
							newAmbDiff: undefined,
						})}, "Update")
						: null
				),
				div(
					button({onClick: ()=>{
						this.state.recording
							? (initiated && recorder.stop())
							: recorder.start()
					}},
						monoButtonText(this.state)
					)
				),
			)
		}

		// the event management stuff
		get recordingStarted(){
			var initiated = Object.prototype.hasOwnProperty.call(this.state, "ambDiff")
			this.setState({recording: true})
			return initiated ? nullFunction : ambiantSeekBegin
		}

		get recordingStopped(){
			var initiated = Object.prototype.hasOwnProperty.call(this.state, "ambDiff")
			this.setState({recording: false})
			return initiated ? nullFunction : ambiantSeekEnd
		}

		get dataReceived(){
			var initiated = Object.prototype.hasOwnProperty.call(this.state, "ambDiff")
			return initiated ? nullFunction : nullFunction
		}
	}


	// functionally private methods
	function monoButtonText(state){
		var recording = state.recording
		var initiated = Object.prototype.hasOwnProperty.call(state, "ambDiff")
		if (recording && initiated){
			return "Stop Auto Recorder"
		}
		else if (!recording && initiated){
			return "Start Auto Recording"
		}
		else if (recording && !initiated){
			return "Please Wait for Calibration"
		}
		else if (!recording && !initiated){
			return "Calibrate"
		}
	}

	function findAvarageOfAudioProcess(e){
		e.inputBuffer.getChannelData(0).forEach(function(tick){
			if (tick > 0){
				maxSum += tick
				maxCount++
			}
			else if (tick < 0){
				minSum += tick
				minCount++
			}
			// there's no point tracking 0 cuz it only dilutes the avarages and should be very rare
		})
	}

	function ambiantSeekBegin(){
		// welp the first thing i'm gonna do is to setup the silly thing where we listen to the raw events cuz the thing is public in the library derp and secnd there's no other way :/
		recorder.scriptProcessorNode.addEventListener("audioprocess", findAvarageOfAudioProcess)

		// k now we record for 3 seconds
		setTimeout(()=>{
			recorder.stop()
		}, 3000)
	}

	function ambiantSeekEnd(){
		recorder.scriptProcessorNode.removeEventListener("audioprocess", findAvarageOfAudioProcess)

		var maxAvarage = maxSum / maxCount
		var minAvarage = minSum / minCount
		var diffAvarage = maxAvarage - minAvarage

		this.setState({ambDiff: diffAvarage})
		// clear it all after so if we need to recalibrate we can
		maxSum = minSum = maxCount = minCount = 0

		console.log(maxAvarage, minAvarage, diffAvarage, this)
	}

})(REP)
