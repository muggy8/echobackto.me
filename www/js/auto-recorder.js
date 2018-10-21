var autoRecorder=function(){var t={workerPath:"ogg_encoder_worker.js",stopItteration:10,end:function(){if("end"!==t.recordState){var t=this;t.processor.disconnect(),t.source.disconnect(),t.audioContext.close();try{t.stream.stop()}catch(e){t.stream.getTracks().forEach(function(t){t.stop()})}t.worker.terminate(),t.recordState="end"}},onRecording:function(){}},e=window.AudioContext||window.webkitAudioContext;return function(i={}){var r=Object.create(t),o=Object.create(r);return Object.assign(r,i),r.worker=new Worker(r.workerPath),r.monitorAmbiant=n.bind(r),r.setAvarage=function(t,e){t&&(this.lAvgDiff=t),e&&(this.rAvgDiff=e)}.bind(r),o.monitorForRecording=function(t){this.lMaxSum=0,this.lMaxCount=0,this.lMinSum=0,this.lMinCount=0,this.rMaxSum=0,this.rMaxCount=0,this.rMinSum=0,this.rMinCount=0,n.call(this,t);var e=this.lMaxSum/this.lMaxCount-this.lMinSum/this.lMinCount,i=this.rMaxSum/this.rMaxCount-this.rMinSum/this.rMinCount;"standby"===this.recordState?e>1.5*this.lAvgDiff&&i>1.5*this.rAvgDiff&&(this.recordState="recording",this.worker.postMessage({cmd:"init",sampleRate:this.audioContext.sampleRate}),this.worker.postMessage({cmd:"write",leftData:t.inputBuffer.getChannelData(0),rightData:t.inputBuffer.getChannelData(1),samplesCount:t.inputBuffer.getChannelData(0).length})):"recording"===this.recordState&&(this.worker.postMessage({cmd:"write",leftData:t.inputBuffer.getChannelData(0),rightData:t.inputBuffer.getChannelData(1),samplesCount:t.inputBuffer.getChannelData(0).length}),e<=this.lAvgDiff&&i<=this.rAvgDiff?this.offIterations<this.stopItteration?this.offIterations++:(this.offIterations=0,this.recordState="standby",this.worker.postMessage({cmd:"finish"})):(e>this.lAvgDiff||i>this.rAvgDiff)&&(this.offIterations=0))}.bind(o),o.recordState="standby",o.offIterations=0,r.lAvgDiff&&r.rAvgDiff||(r.lMaxSum=0,r.lMaxCount=0,r.lMinSum=0,r.lMinCount=0,r.lAvgDiff=void 0,r.rMaxSum=0,r.rMaxCount=0,r.rMinSum=0,r.rMinCount=0,r.rAvgDiff=void 0),navigator.mediaDevices.getUserMedia({audio:!0,video:!1}).then(function(t){var n;if(r.stream=t,r.audioContext=new e(t),r.source=r.audioContext.createMediaStreamSource(t),r.processor=r.audioContext.createScriptProcessor(4096,2,2),r.source.connect(r.processor),r.processor.connect(r.audioContext.destination),!r.lAvgDiff||!r.rAvgDiff)return r.processor.addEventListener("audioprocess",r.monitorAmbiant),n=3e3,new Promise(function(t){setTimeout(t,n)})}).then(function(){return r.processor.removeEventListener("audioprocess",r.monitorAmbiant),r.lAvgDiff&&r.rAvgDiff||(r.lAvgDiff=r.lMaxSum/r.lMaxCount-r.lMinSum/r.lMinCount,r.rAvgDiff=r.rMaxSum/r.rMaxCount-r.rMinSum/r.rMinCount,delete r.lMaxSum,delete r.lMaxCount,delete r.lMinSum,delete r.lMinCount,delete r.rMaxSum,delete r.rMaxCount,delete r.rMinSum,delete r.rMinCount),r.processor.addEventListener("audioprocess",o.monitorForRecording),r.worker.onmessage=function(t){o.onRecording(t.data)},o})};function n(t){var e=this;t.inputBuffer.getChannelData(0).forEach(function(t){t>0?(e.lMaxSum=+t,e.lMaxCount++):t<0&&(e.lMinSum+=t,e.lMinCount++)}),t.inputBuffer.getChannelData(1).forEach(function(t){t>0?(e.rMaxSum=+t,e.rMaxCount++):t<0&&(e.rMinSum+=t,e.rMinCount++)})}}();