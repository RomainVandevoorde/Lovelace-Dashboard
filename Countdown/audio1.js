window.onload = () => {

  console.log(navigator.getUserMedia);

  let meterObject = new volumeMeter();

  document.getElementById('activate').addEventListener('click', function(e){
    meterObject.createMeter();
    mainLoop(meterObject);
  });

}




let mainLoop = (object) => {

  // console.log('mainLoop');

  // if(object.meter.volume === undefined) {
  //   console.log('create meter');
  //   object.createMeter();
  // }

  let level = Math.log10(object.meter.volume)*20 + 80;

  document.getElementsByTagName('p')[0].innerHTML = level;

  window.setTimeout(function(){mainLoop(object);}, 100);
}


class volumeMeter {

  constructor() {
    this.audioContext = null;
    this.mediaStreamSource = null;
    this.streamOn = false;
    this.meter = "nope";
  }

  // Main function
  createMeter() {
    // First, create an audio context
    this.getAudioContext();
    // Second, get a stream from the navigator
    this.getNavStream();

    // Thrid, check if we got a stream
    // console.log("streamOn: "+ this.streamOn);

    // If we do, bind audio context to stream source
    // Then create a processor
    // Then bind the processor to the audio context (connect)

    // console.log(this.meter.volume);

  }

  // get meter() {
  //   return this.meter;
  // }
  //
  // set meter(obj) {
  //   this.meter = obj;
  // }

  // Gets audio context
  getAudioContext() {
    // console.log(this.audioContext);
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContext();
    console.log('audioContext created');
  }

  getNavStream() {
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            }
        }, this.gotStream.bind(this), this.didntGetStream.bind(this));
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
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
    processor.connect(this.audioContext.destination);

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

class audioProcessor {

  constructor() {

  }

  createAudioMeter(audioContext,clipLevel,averaging,clipLag) {

}

}
