window.onload = () => {

  document.getElementById('activate').addEventListener('click', function(e){
    this.style.display = 'none';
    let meterObject = new volumeMeter();
    meterObject.createMeter();
    mainLoop(meterObject);
  });

}

let mainLoop = (volumeMeter) => {

  let level = Math.round(volumeMeter.meter.volume*100);

  document.getElementsByTagName('p')[0].innerHTML = volumeMeter.meter.volume+"<br>"+level;

  window.setTimeout(function(){mainLoop(volumeMeter);}, 50);
}


class volumeMeter {

  constructor() {
    this.mediaStreamSource = null;
    this.streamActive = false;

    // Initiate processor and audiocontext
    this.audioContext = this.getAudioContext();
    this.meter = this.createProcessor();
  }

  // Main function
  createMeter() {

    this.getMediaStream()
    .then(this.bindStreamProcessor.bind(this), this.returnError.bind(this));

  }

  // Gets audio context
  getAudioContext() {
    // console.log(this.audioContext);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioContext = new AudioContext();
    console.log('audioContext created');
    return audioContext;
  }

  getMediaStream() {
    return new Promise((resolve, reject) => {
      // monkeypatch getUserMedia
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      // ask for an audio input
      navigator.getUserMedia({
        "audio": {
          "mandatory": {
            "googEchoCancellation": "false",
            "googAutoGainControl": "false",
            "googNoiseSuppression": "false",
            "googHighpassFilter": "false"
          },
          "optional": []
        }
      }, resolve, reject);
    });
  };

  // Takes a MediaStream object and biends it to the audio context
  setCtxStreamSource(stream) {
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
  }

  bindStreamProcessor(stream) {
    console.log('bindStreamProcessor');
    // Create an AudioNode from the stream.
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);

    // Connect the AudioNode to the Processor
    this.mediaStreamSource.connect(this.meter);

    console.log('success');
  }

  returnError(e) {
    console.log(e);
  }

  didntGetStream() {
    this.streamOn = false;
      alert('Stream generation failed.');
  }

  gotStream(stream) {
    this.streamOn = true;
      console.log('gotStream');

      // Create an AudioNode from the stream.
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      console.log('gotStream OK');

      // Create a new volume meter and connect it.
      this.meter = this.createProcessor();
      this.mediaStreamSource.connect(this.meter);
  }

  // Returns a processor object for the audioContext
  createProcessor() {
    let processor = this.audioContext.createScriptProcessor(512);
    processor.onaudioprocess = this.volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = 0.98;
    processor.averaging = 0.95;
    processor.clipLag = 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    // processor.connect(this.audioContext.destination);

    processor.checkClipping =
      function(){
        if (!this.clipping)
          return false;
        if ((this.lastClip + this.clipLag) < window.performance.now())
          this.clipping = false;
        return this.clipping;
      };

    processor.shutdown =
      function(){
        this.disconnect();
        this.onaudioprocess = null;
      };

    return processor;
  }

  volumeAudioProcess(event) {
  		var buf = event.inputBuffer.getChannelData(0);
      var bufLength = buf.length;
  		var sum = 0;
      var x;

  		// Do a root-mean-square on the samples: sum up the squares...
      for (var i=0; i<bufLength; i++) {
      	x = buf[i];
      	if (Math.abs(x)>=this.clipLevel) {
      		this.clipping = true;
      		this.lastClip = window.performance.now();
      	}
      	sum += x * x;
      }

      // ... then take the square root of the sum.
      var rms =  Math.sqrt(sum / bufLength);

      // Now smooth this out with the averaging factor applied
      // to the previous sample - take the max here because we
      // want "fast attack, slow release."
      this.volume = Math.max(rms, this.volume*this.averaging);
  }

}
