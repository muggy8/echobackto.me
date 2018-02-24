(function(context){

	if (navigator.serviceWorker){
		try{
			navigator.serviceWorker.register("progressive-web-app-sw.js");
		}
		catch(o3o){
			console.warn(o3o);
		}
	}

	// logic for recoring app
	var recorder, backgroundNoiseLevel, backgroundAvarageTotal;
	var bgPeakL = bgTrophL = bgPeakR = bgTrophR = recordable = 0;

	function initRecording(){

		if (!Recorder.isRecordingSupported()) {
			alert("browser not supported");
			return;
		}
		if (recorder){
			recorder.start();
			recorder.pause();
			return;
		}

		recorder = new Recorder({
			//monitorGain: 0,
			//numberOfChannels: 2,
			//bitRate: 48000,
			//encoderSampleRate: 64000,
			leaveStreamOpen: true,
			encoderPath: "/js/recorder/encoderWorker.min.js"
		});

		recorder.addEventListener( "stop", function(e){

			//console.log("recording stopped");
		});

		recorder.addEventListener( "streamError", function(e){
			console.log("Error encountered: " + e.error.name );
		});

		var itterations = 0;
		recorder.onData(function(chunk){
			if (!recordable){
				recorder.stop();
				return;
			}
			//console.log("got chunk");
			inputL = chunk.inputBuffer.getChannelData(0);
			//inputR = chunk.inputBuffer.getChannelData(1);
			var inputPeakL = inputTrophL = inputPeakR = inputTrophR = 0;
			inputL.forEach(function(tick){
				if (tick > inputPeakL){
					inputPeakL = tick
				}
				if (tick < inputTrophL){
					inputTrophL = tick
				}
			})
			/*inputR.forEach(function(tick){
				if (tick > inputPeakR){
					inputPeakR = tick
				}
				if (tick < inputTrophR){
					inputTrophR = tick
				}
			})*/

			var chunkDeltaL = inputPeakL - inputTrophL;
			//var chunkDeltaR = inputPeakR - inputTrophR;

			if (!backgroundNoiseLevel){
				if (inputPeakL > bgPeakL){bgPeakL = inputPeakL}
				if (inputTrophL < bgTrophL){bgTrophL = inputTrophL}
				//if (inputPeakR > bgPeakR){bgPeakR = inputPeakR}
				//if (inputTrophR < bgTrophR){bgTrophR = inputTrophR}
				itterations++;
				backgroundAvarageTotal = backgroundAvarageTotal || 0;
				backgroundAvarageTotal += chunkDeltaL
				if (itterations >= 30){
					backgroundNoiseLevel = 1;
					//console.log(bgPeakL - bgTrophL/*, bgPeakR - bgTrophR*/);
					backgroundNoiseLevel = backgroundAvarageTotal/itterations*1.5 //(bgPeakL - bgTrophL) * 1.5;
					itterations = 0;
					ui.appReady();
				}
			}
			else{
				if (recorder.state == "paused" && chunkDeltaL > backgroundNoiseLevel*2){
					recorder.resume();
					itterations = 0;
				}
				if (recorder.state == "recording" && chunkDeltaL < backgroundNoiseLevel*0.75){
					itterations++;
					if (itterations >= 15){
						recorder.stop();
					}
				}
			}
		});

		recorder.addEventListener("dataAvailable", function(e){

			//console.log([e.detail]);
			var dataBlob = new Blob( [e.detail], { type: "audio/ogg" } );
			var fileName = new Date().toISOString() + ".ogg";
			var url = URL.createObjectURL( dataBlob );

			var audio = document.createElement("audio");
			audio.autoplay = true;
			audio.addEventListener("canplaythrough", function(ev){
				audio.play();
			})

			audio.controls = true;
			audio.src = url;

			var link = document.createElement("a");
			link.href = url;
			link.download = fileName;
			link.innerHTML = link.download;

			var li = document.createElement("li");
			li.appendChild(link);
			li.appendChild(audio);

			var recordingslist = document.querySelector("#recordings");
			recordingslist.insertBefore(li, recordingslist.children[0]);

			var newCycle = function(){
				audio.removeEventListener("ended", newCycle);
				audio.removeEventListener("pause", newCycle);
				if (recordable){
					initRecording();
				}
				//console.log("recording cycle stopped");
			}

			audio.addEventListener("ended", newCycle);
			audio.addEventListener("pause", newCycle);
		});

		recorder.initStream();
		//console.log("Initiated");
		recorder.addEventListener( "streamReady", function(e){
			//console.log("Audio stream is ready.");

			recorder.start();
			recorder.pause();
		});
		//recorder.pause();
		//recorder.start();
	}
	//initRecording();

	// logic for the UI
	Array.prototype.forEach.call(document.querySelectorAll("nav a"), function(btn, btnIndex, selection){
		btn.addEventListener("click", function(ev){
			ev.preventDefault();
			var tabTarget = btn.getAttribute("target")
			//console.log(tabTarget);
			selection.forEach(function(btn){
				btn.className = btn.className.replace(/\s*viewing/g, "");
			})
			btn.className += " viewing";

			if (!tabTarget){return}

			Array.prototype.forEach.call(document.querySelectorAll(".tab-body"), function(tab, tabIndex, tabSelection){
				tab.className = tab.className.replace(/\s*viewing/g, "");
			});
			document.querySelector("#"+tabTarget).className += " viewing";
		})
	})

	var ui = {};
	ui.loneBtn = document.querySelector("#lone-btn");

	var appVersionCall = new XMLHttpRequest();
	appVersionCall.open("GET", "/version.json");
	appVersionCall.addEventListener("load", function(ev){
		console.log(ev);
		if (appVersionCall.response){
			var callRes = JSON.parse(appVersionCall.response);
			var versionMeta = document.querySelector("meta[name='version']");
			if (versionMeta.getAttribute("content") !== callRes.version) {
				console.log("different version");
			}
		}
	});
	appVersionCall.send();

	ui.initOnce = function(ev){
		recordable = true;
		initRecording();
		ui.loneBtn.innerHTML = "Please stay slient for a small bit";
		ui.loneBtn.removeEventListener("click", ui.initOnce);
	}
	ui.loneBtn.addEventListener("click", ui.initOnce);

	ui.appReady = function(){
		ui.loneBtn.innerHTML = "App is currently: Active";
		var sensitivityBox = document.querySelector("#sensitivity");
		sensitivityBox.setAttribute("value", + backgroundNoiseLevel);
		sensitivityBox.parentNode.className = sensitivityBox.parentNode.className.replace(/\s*hidden/g, "");

		var sensitivityUpdate = document.querySelector("#sensitivity-update");
		sensitivityUpdate.addEventListener("click", function(){
			backgroundNoiseLevel = parseFloat(sensitivityBox.value);
		})

		ui.loneBtn.addEventListener("click", function(){
			recordable = !recordable;
			var mode = {0: ": Paused", 1: ": Active", true: ": Active", false: ": Paused"}
			ui.loneBtn.innerHTML = "App is currently: On".replace(/(\:\sOn|\:\sOff)/gi, mode[recordable])

			if (recordable){
				initRecording();
			}
		})
	}

})(this)
