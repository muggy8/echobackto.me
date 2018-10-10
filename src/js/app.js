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
					a((()=>{
						let props = {href: "#"}
						if (App.Constants.homeRout.test(this.state.path)){
							props.className = "active"
						}
						return props
					})(), "App"),
					a((()=>{
						let props = {href: "#"}
						if (App.Constants.aboutRout.test(this.state.path)){
							props.className = "active"
						}
						return props
					})(), "About"),
				),
				(()=>{
					if (App.Constants.homeRout.test(this.state.path)){
						return React.createElement(App.Components.Recorder, this.state)
					}
					else if (App.Constants.aboutRout.test(this.state.path)){
						return React.createElement(App.Components.AboutPage, this.state)
					}
				})()
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
