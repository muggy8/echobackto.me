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
	var workerPath = "deps/chrome_ogg_encoder/ogg_encoder_worker.js"

	function nullFunction(){}

	// ok here's the actual class that does stuff :3
	return class extends React.Component {
		constructor(prop){
			super(prop)
			var context = this
			context.state = prop.state
		}

		componentWillUnmount(){
			this.state.recorder.end()
		}

		render(){
			var initiated = Object.prototype.hasOwnProperty.call(this.state, "recorder")
			return div({className: "content"},
				div(
					div("Ambiant Noise Level: "),
					div(
						span("Left: "),
						input({
							value: this.state.newLAvgDiff || (this.state.recorder && this.state.recorder.lAvgDiff) || "",
							type: "number",
							min: 0,
							max: 1,
							onChange: (ev)=>this.setState({newLAvgDiff: ev.target.value}),
							disabled: !initiated ? "disabled" : undefined,
							placeholder: "Ambient L"
						}),
						span("Right: "),
						input({
							value: this.state.newRAvgDiff || (this.state.recorder && this.state.recorder.rAvgDiff) || "",
							type: "number",
							min: 0,
							max: 1,
							onChange: (ev)=>this.setState({newRAvgDiff: ev.target.value}),
							disabled: !initiated ? "disabled" : undefined,
							placeholder: "Ambient R"
						}),
						initiated
							? button({onClick: ()=>this.setState({
								newLAvgDiff: this.state.recorder.setAvarage(this.state.newLAvgDiff, this.state.newRAvgDiff),
								newRAvgDiff: undefined,
							})}, "Update")
							: null
					),
				),
				div(
					button({onClick: ()=>{
						var awaitingRecorder
						if (initiated && this.state.recorder.recordState === "end"){
							awaitingRecorder = autoRecorder({
								workerPath,
								lAvgDiff: this.state.recorder.lAvgDiff,
								rAvgDiff: this.state.recorder.rAvgDiff
							}).then((res)=>this.setState({recorder: res, recording: true}))
						}
						else if (initiated){
							this.state.recorder.end()
							this.setState({recording: false})
							awaitingRecorder = Promise.resolve()
						}
						else{
							awaitingRecorder = autoRecorder({
								workerPath
							}).then((res)=>this.setState({recorder: res, recording: true}))
						}
						this.setState({waitingOn: awaitingRecorder})
						awaitingRecorder.then(()=>this.setState(
							(state)=>{
								return {
									waitingOn: state.waitingOn === awaitingRecorder
										? undefined
										: state.waitingOn
								}
							}
						))
					}},
						monoButtonText(this.state)
					)
				),
			)
		}
	}


	// functionally private methods
	function monoButtonText(state){
		var initiated = Object.prototype.hasOwnProperty.call(state, "recorder")
		var waiting = !!state.waitingOn
		if (!initiated && waiting){
			return "calibrating..."
		}
		else if (!initiated){
			return "Calibrate and Began Recording"
		}
		else if (initiated && !state.recording){
			return "Begin Recording"
		}
		else if (initiated){
			return "Stop Recording"
		}
	}

})(REP)
