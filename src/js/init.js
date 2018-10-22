ReactDOM.render(
	React.createElement(App),
	document.getElementById("root")
)

if ("serviceWorker" in navigator){
	window.addEventListener("load", function(){
		navigator.serviceWorker.register("sw.js")
	})
}
