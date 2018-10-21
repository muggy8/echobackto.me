App.Components.RecordingList = (function({ul, li, audio, a}){
	return class extends React.Component {
		render(){
			// console.log("called", this.state, this.props)
			return ul({className: "list"},
				this.props.list.map((recording)=>li({key: recording.id},
					a({href: recording.audio, download:`${recording.id}.ogg`},
						`${recording.id}.ogg`
					),
					audio({
						autoPlay: true,
						controls: true,
						src: recording.audio,
						onEnded: this.props.playbackComplete,
					}),
				)).reverse()
			)
		}
	}
})(REP)
