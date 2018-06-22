
// const circle = document.getElementsByTagName('circle')[0];
const circle = document.getElementById('noiseCircle');
const number = document.getElementById('noiseNumber');
const vw = window.innerWidth; // viewport width
const increase = vw - 100;
const mainText = document.getElementsByTagName('h1')[0];
const scdText = document.getElementsByTagName('h2')[0];

class VolumeMeter {
  constructor() {
    // Settings
    this.nbDataRecords = 40; // Number of data points to save

    this.maxHistory = []; // Max storage
    this.lastMaxTime = 0; // Last time max was increased
    this.lastMaxStoreTime = 0; // Last time max was saved

    this.lastRMS = 0;
    this.allTimeMin = null;
    this.allTimeMax = null;
    this.data = [];
    this.avg = null;
    this.scaledAvg = null;
    this.color = "rgb(0,0,0)";

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.gotStream = false;
    this.streamStart = 0;

    this.analyser.fftSize = 128;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.checkSupport();
  }

  checkSupport() {
    if (navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia supported.');
      this.support = true;
    } else {
      alert('getUserMedia not supported');
      this.support = false;
    }
  }

  getMediaStream() {

    if(!this.support) return false;

    navigator.mediaDevices.getUserMedia({audio:true})
    .then(this.bindStream.bind(this))
    .catch( function(err) { console.log('The following gUM error occured: ' + err);});
  }

  bindStream(stream) {
    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
    this.gotStream = true;
    this.streamStart = Date.now();
  }

  main() {
    this.calcRMS();
    let now = Date.now();
    if(now - vm.streamStart > 2000 && this.gotStream) {
      this.pushData();
      this.avgData();
    }
    if(this.data.length > 39) {
      if(!this.allTimeMax || this.avg > this.allTimeMax) {
        this.lastMaxTime = now;
        this.allTimeMax = this.avg;
      }
      if(!this.allTimeMin || this.avg < this.allTimeMin) this.allTimeMin = this.avg;
    }
    if(this.allTimeMin && this.allTimeMax && this.allTimeMax - this.allTimeMin > 0) {
      this.calcScaledAvg();
      this.calcColor();
      if((now - this.streamStart) > 60000 && (now - this.lastMaxStoreTime) > 120000) {
        this.lastMaxStoreTime = now;
        this.maxHistory.push(this.allTimeMax);
        console.log("logged max");
      }
      if(now - this.lastMaxTime > 300000) {
        this.lastMaxTime = now;
        this.allTimeMax -= this.allTimeMax/20;
      }
    }
  }

  calcRMS() {
    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;

    for(var i = 0; i < this.bufferLength; i++) {
      let x = (this.dataArray[i]*1.0)/256.0;
      sum += x*x;
    }

    this.lastRMS = Math.sqrt(sum/this.bufferLength);
  }

  pushData() {
    if(this.data.length >= this.nbDataRecords) this.data.shift();
    this.data.push(this.lastRMS);
  }

  avgData() {
    let len = this.data.length;
    let total = 0;
    for(let i = 0; i < len; i++) {
      total += this.data[i];
    }
    this.avg = total/len;
  }

  calcScaledAvg() {
    this.scaledAvg = 100*(this.avg - this.allTimeMin)/(this.allTimeMax - this.allTimeMin);
  }

  calcColor() {
    let step1 = 30; // Volume pour la couleur orange
    if(this.scaledAvg < 0) this.color = "rgb(0,0,0)";
    else if(this.scaledAvg <= step1) {
      let redLvl = (this.scaledAvg/step1)*255;
      this.color = "rgb("+redLvl+",255,0)";
    }
    else if(this.scaledAvg <= 100) {
      let greenLvl = 255 - (((this.scaledAvg-(step1))/(100 - step1))*255);
      this.color = "rgb(255,"+greenLvl+",0)";
    }
    else this.color = "rgb(255,0,0)";
  }
}

vm = new VolumeMeter();
vm.getMediaStream();

let timeline = new Timeline();

let then = 0;
let delay = 50;

function vmLoop(time) {

  if((time - then) > delay) {

    then = time;

    vm.main();

    if(vm.scaledAvg !== null) {
      // let increase = vw - 100;
      let size = (Math.floor(vm.scaledAvg*(increase/100))+100)+"px";
      circle.style.width = size;
      circle.style.height = size;
      circle.style.borderTopRightRadius = size;
      circle.style.backgroundColor = vm.color;
      number.innerHTML = Math.floor(vm.scaledAvg);
      number.style.fontSize = Math.floor(20 + vm.scaledAvg/2) + "px";
    }
    let content = timeline.getCountdown();
    mainText.innerHTML = content[0] + ":" + content[1] + ":" + content[2];
    scdText.innerHTML = content[3] || "";

  }

  requestAnimationFrame(vmLoop);
}

requestAnimationFrame(vmLoop);
