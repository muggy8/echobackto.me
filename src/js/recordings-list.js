App.Components.RecordingList = (function({ul, li, audio, a}){
	return class extends React.Component {
		render(){
			// console.log("called", this.state, this.props)
			return ul(
				this.props.list.map((recording)=>li({key: recording.id, className: "list"},
					a({href: recording.audio, download:`${recording.id}.ogg`},
						`${recording.id}.ogg`
					),
					audio({
						autoPlay: true,
						controls: true,
						src: recording.audio,
						onEnded: this.props.playbackComplete,
					}),
				))
			)
		}
	}
})(REP)
