const App = (function({div, h1, nav, a}){
	// lets do some good old fassioned dependency injection the angular way cuz why the heck not
    let components = {}
	let constants = {
		homeRout: /^\/$/,
		aboutRout: /^\/about$/,
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
					a(this.homeRoutProps, "App"),
					a(this.aboutRoutProps, "About"),
				),
				this.appBody
			)
		}

        static get Components(){
            return components
        }

        static get Constants(){
            return constants
        }

		get homeRoutProps(){
			let props = {
	            href: "#",
	            onClick: (ev)=>{
	                ev.preventDefault()
	                this.setState({path: "/"})
	            },
	        }
			if (App.Constants.homeRout.test(this.state.path)){
				props.className = "active"
			}
			return props
		}

		get aboutRoutProps(){
			let props = {
				href: "#",
				onClick: (ev)=>{
					ev.preventDefault()
					this.setState({path: "/about"})
				},
			}
			if (App.Constants.aboutRout.test(this.state.path)){
				props.className = "active"
			}
			return props
		}

		get appBody(){
			if (App.Constants.homeRout.test(this.state.path)){
				return React.createElement(App.Components.Recorder, {state: this.state})
			}
			else if (App.Constants.aboutRout.test(this.state.path)){
				return React.createElement(App.Components.AboutPage, this.state)
			}
		}
	}
})(REP)
