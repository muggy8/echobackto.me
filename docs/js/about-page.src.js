App.Components.AboutPage = (function({div, p, strong, a}){
	return class extends React.Component {
		render(){
			return div({className: "content"},
				p("Echo Back to Me is a web application that echos what you say back at you hands free. For best results, please use with headphones. For mobile users, please read the workaround below."),
				p(
					strong("Usage"),
					" You first need to calibrate your the app to your surrounding environment so it can automatically turn on and off the listener. During this process, you should be as quiet as you can and let the recording only detect your ambient surrounding noise. Once that's done, you can toggle listening mode on and off.",),
				p("if calibration results in a sensitivity that's beyond 0.4, it's likely that your environment is either really loud or that you made a sound somewhere during the calibration process (dropped a pen maybe?). If this is the case, just refresh the page and try again (or adjust manually)."),
				p(
					strong("Mobile Workaround 1:"),
					" Use Firefox for Android (I would imagine same for iOS) as they allow autoplay for media content by default and has an easy and convenient setting that you can access to toggle this on and off."),
				p(
					strong("Mobile Workaround 2:"),
					" To protect users from unwanted data charges, mobile browsers require you to interact with a media source to play it's contents (aka audio and video) so if a video or audio attempts to auto play in a page, it wont be allowed to on mobile and hence protecting you from potential unwanted data charges. Echo Back to Me doesn't load media assets off the net and as a result doesn't have that problem however this still applies to the audio element that is used. to get around this you must be using a stable version of mobile Chrome that's version 47 or later (just update your chrome from the appstore / google play unless you're on a really old device). You must then allow chrome to autoplay media by setting \"disable-gesture-requirement-for-media-playback\" to \"enabled\". it is strongly recommended that you re-disable \"disable-gesture-requirement-for-media-playback\" when you're done using this app for your safety."),
				p("To enable this work around, visit chrome://flags/#disable-gesture-requirement-for-media-playback and click on the enable button."),
				p(
					"This app is built on top of ",
					a({href: "https://github.com/astroza/chrome_ogg_encoder"}, "astroza's chrome_ogg_encoder"),
				),
				p("Feel free to ", a({href: "https://github.com/muggy8/echobackto.me"}, "fork this project on github")),
			)
		}
	}
})(REP)
