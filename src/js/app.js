const App = (function({div, h1, nav, a}){
	// lets do some good old fassioned dependency injection the angular way cuz why the heck not
	let components = {}
	let constants = {
		homeRout: /^\/$/,
		aboutRout: /^\/about$/,
	}

	function homeRoutProps(context){
		let props = {
			href: "#",
			onClick: (ev)=>{
				ev.preventDefault()
				context.setState({path: "/"})
			},
		}
		if (App.Constants.homeRout.test(context.state.path)){
			props.className = "active"
		}
		return props
	}

	function aboutRoutProps(context){
		let props = {
			href: "#",
			onClick: (ev)=>{
				ev.preventDefault()
				context.setState({path: "/about"})
			},
		}
		if (App.Constants.aboutRout.test(context.state.path)){
			props.className = "active"
		}
		return props
	}

	function appBody(context){
		if (App.Constants.homeRout.test(context.state.path)){
			return React.createElement(App.Components.Recorder, {state: context.state})
		}
		else if (App.Constants.aboutRout.test(context.state.path)){
			return React.createElement(App.Components.AboutPage, context.state)
		}
	}

	return class App extends React.Component {
		constructor(){
			super()
			this.state = {
				path: "/",
			}
		}

		render(){
			return div({},
				h1("Echo Back To Me"),
				nav(
					a(homeRoutProps(this), "App"),
					a(aboutRoutProps(this), "About"),
				),
				appBody(this)
			)
		}

		static get Components(){
			return components
		}

		static get Constants(){
			return constants
		}
	}
})(REP)
