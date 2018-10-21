App.Components.RecordingList = (function({ul, li, audio, a}){
	return class extends React.Component {
		render(){
			// console.log("called", this.state, this.props)
			return ul({className: "list island"},
				this.props.list.map((recording)=>li({key: recording.id, className: "flex hcenter cell"},
					audio({
						autoPlay: true,
						controls: true,
						src: recording.audio,
						onEnded: this.props.playbackComplete,
					}),
					a({href: recording.audio, download:`${recording.id}.ogg`, className: "flex vcenter island-h", role: "button"},
						`Download`
					),
				)).reverse()
			)
		}
	}
})(REP)
