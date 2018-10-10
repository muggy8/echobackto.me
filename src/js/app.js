const App = (function({div}){
	// lets do some good old fassioned dependency injection the angular way cuz why the heck not
    let components = {}
	return class App extends React.Component {
		render(){
			return div({})
		}

        static get Components(){
            return components
        }
	}
})(React.DOM)
