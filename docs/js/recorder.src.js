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

	function uuid(){return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)})}

	// ok here's the actual class that does stuff :3
	return class extends React.Component {
		constructor(prop){
			super(prop)
			var context = this
			context.state = prop.state
			context.state.list = []
		}

		componentWillUnmount(){
			this.state.recorder && this.state.recorder.end()
		}

		render(){
			var initiated = Object.prototype.hasOwnProperty.call(this.state, "recorder")
			return div({className: "content"},
				div(
					div("Ambient Noise Levels "),
					div({className: "flex hcenter island"},
						div({className: "flex-responsive vhcenter text-right"},
							div({className: "cell-h"},
								span("Left: "),
								input({
									value: this.state.newLAvgDiff || (this.state.recorder && this.state.recorder.lAvgDiff) || "",
									type: "number",
									min: 0,
									max: 1,
									onChange: (ev)=>this.setState({newLAvgDiff: ev.target.value}),
									disabled: !initiated ? "disabled" : undefined,
									placeholder: "Ambient L",
									size: 5,
								}),
							),
							div({className: "cell-h"},
								span("Right: "),
								input({
									value: this.state.newRAvgDiff || (this.state.recorder && this.state.recorder.rAvgDiff) || "",
									type: "number",
									min: 0,
									max: 1,
									onChange: (ev)=>this.setState({newRAvgDiff: ev.target.value}),
									disabled: !initiated ? "disabled" : undefined,
									placeholder: "Ambient R",
									size: 5,
								}),
							),
						),
						initiated
							? button({onClick: ()=>this.setState({
								newLAvgDiff: this.state.recorder.setAvarage(this.state.newLAvgDiff, this.state.newRAvgDiff),
								newRAvgDiff: undefined,
							}), className: "island-h"}, "Update")
							: null
					),
				),
				div(
					button({className: "fs-1.5em", onClick: ()=>{
						var awaitingRecorder
						if (initiated && this.state.recorder.recordState === "end"){
							awaitingRecorder = autoRecorder({
								workerPath,
								lAvgDiff: this.state.recorder.lAvgDiff,
								rAvgDiff: this.state.recorder.rAvgDiff
							})
							.then((res)=>this.setState({recorder: res, recording: true}))
							.then(()=>setupRecorder(this.state.recorder, this))
						}
						else if (initiated){
							this.state.recorder.end()
							this.setState({recording: false})
							awaitingRecorder = Promise.resolve()
						}
						else{
							awaitingRecorder = autoRecorder({
								workerPath
							})
							.then((res)=>this.setState({recorder: res, recording: true}))
							.then(()=>setupRecorder(this.state.recorder, this))
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
				React.createElement(App.Components.RecordingList, {list: this.state.list, playbackComplete: playbackComplete.bind(this)})
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

	function setupRecorder(recorder, context = this){
		recorder.onRecording = onNewRecording.bind(context)
	}

	function onNewRecording(e){
		var audio = "data:audio/ogg;base64," + arrayBufferToBase64(e.buffer)
		this.setState({
			list: this.state.list.concat([{
				audio,
				id: uuid()
			}]),
		})
		this.state.recorder.recordState = "playback"
	}

	function playbackComplete(){
		this.state.recorder.recordState = "standby"
	}

})(REP)
