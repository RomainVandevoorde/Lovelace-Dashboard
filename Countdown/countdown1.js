window.onload = () => {

  let events = new Events();
  events.initList();

  $("#add-target-button").click(function() {

    $("#add-target-modal").modal({
      onApprove : function(e) {
        // window.alert('Approved!');
        let form = this.getElementsByTagName('form')[0];
        console.log(form[0].value, form[1].value, form[2].value, form[3].value, form[4].value);
      }
    }).modal('show');

  });

  let ui = new UI();
  let countdown = new Countdown();

  // Pass the UI and Countdown objects to the main loop
  let cdLoopID = window.setInterval(countdownLoop, 100, ui, countdown);

  // Create menu hide/show button
  document.getElementById('show-menu').addEventListener('click', ()=>{ui.toggleMenu();});


  // Create event for activate audio meter button
  document.getElementById('activate').addEventListener('click', function(e){
    let meterObject = new volumeMeter();
    let volumeProc = new volumeProcessor();
    meterObject.createMeter()
    .then(() => {
      console.log('UI init');
      window.setInterval(dataLoop, 100, meterObject, volumeProc, ui);
      this.innerHTML = "Désactiver";
      this.dataset.active = true;
    })
    .catch((e) => {
      console.log(e);
      if(e.name === "NotAllowedError") {
        let error = "<b>EN</b>: You must allow the page to access your microphone, or the Volume Meter won't be able to work.<br><b>FR</b>: Vous devez autoriser la page à accéder à votre microphone, ou le Volume Meter ne pourra pas fonctionner.";
        document.getElementById('audiocontrols').innerHTML += '<p style="color:red">'+error+'</p>';
      }
      else {
        alert("Error: "+e.name+": Check the logs for more details.");
      }
    });
    // mainLoop(meterObject);


  });

  // document.getElementById('test').addEventListener('click', function() {
  //   window.clearInterval(cdLoopID);
  // });

};

let dataLoop = (audioMeter, volumeProcessor, ui) => {

  let data = audioMeter.meter.volume*100;
  volumeProcessor.storeData(data);
  ui.debug.innerHTML = volumeProcessor.av+"<br>"+volumeProcessor.data.length;

};


let countdownLoop = (ui, cd) => {

  // Get the events from the UI
  let events = ui.getEvents();
  // Get the info required for display
  let info = cd.getDisplayInfo(events);

  // Put the info in the UI
  ui.fillCountdown(info);
};


// Permet d'interragir avec l'UI
class UI {

  constructor() {
    // Block containing "new event" form
    this.addEventBlock = document.getElementById('add-event');
    // Block containing event list
    this.eventListBlock = document.getElementById('events-list');
    // Block containing countdown display
    this.displayBlock = document.getElementById('countdown');
    // Button to toggle menu on/off
    this.menuButton = document.getElementById('show-menu');
    // Main menu block
    this.menu = document.getElementById('event-menu');

    // Debugging
    // TODO Remove before push to prod
    this.debug = document.getElementById('debug').getElementsByTagName('p')[0];
  }

  getEvents() {
    let eventsArray = [];

    let events = this.eventListBlock.getElementsByClassName('event-form');

    for (let i = 0; i < events.length; i++) {

      let eventHourVal = events[i].getElementsByTagName('input')[1].value;
      let eventMinuteVal = events[i].getElementsByTagName('input')[2].value;
      let eventDescVal = events[i].getElementsByTagName('textarea')[0].value;

      eventsArray.push([eventHourVal, eventMinuteVal, eventDescVal]);
    }

    return eventsArray;
  }

  // Receives an array containing (hours, minutes, seconds, description)
  // Displays it in UI
  fillCountdown(info) {
    this.displayBlock.getElementsByTagName('h1')[0].innerHTML = info[0]+':'+info[1]+':'+info[2];
    this.displayBlock.getElementsByTagName('p')[1].innerHTML = info[3];
  }

  toggleMenu() {
    if(this.menu.style.display === 'block') this.menu.style.display = 'none';
    else this.menu.style.display = 'block';
  }

}

class Countdown {

  constructor() {
    this.events = [];
  }

  // Loops through an array of events and validates each one
  validateEvents(events) {
    let validEvents = [];

    // Loop thourgh the events and validate each one
    for (let i = 0; i < events.length; i++) {
      let validEvent = this.validateEvent(events[i]);
      if(validEvent.length !== 0) validEvents.push(validEvent);
    }

    return validEvents;
  }

  // Validates a single event. Will return an empty array if it's invalid
  validateEvent(array) {

    // Convert the strings to valid types
    let eventHour = parseInt(array[0]);
    let eventMinute = parseInt(array[1]);
    let eventDesc = array[2];

    // Check hour validity
    if(!Number.isInteger(eventHour)) return [];
    if(eventHour < 0 || eventHour > 24) return [];

    // Check minute validity
    if(!Number.isInteger(eventMinute)) return [];
    if(eventMinute < 0 || eventMinute > 59) return [];

    return [eventHour, eventMinute, eventDesc];
  }

  // Takes in events and returns the delay to display
  getDisplayInfo(events) {

    let validEvents = this.validateEvents(events);

    // validateEvents will return an empty array if there are no valid events to display
    if(validEvents.length === 0) return ["00", "00", "00", ""];

    // Temporary. Will require a loop if the script is to manage multiple events (TODO)
    let displayEvent = validEvents[0];

    let msDelay = this.getMsDelay(displayEvent);
    let delay = this.msToTimeUnits(msDelay);
    let info = this.getDisplayTime(delay);

    info.push(displayEvent[2]);

    return info;
  }

  getDisplayTime(array) {
    let hours = array[0].toString();
    let minutes = array[1].toString();
    let seconds = array[2].toString();

    if(hours.length < 2) hours = "0"+hours;
    if(minutes.length < 2) minutes = "0"+minutes;
    if(seconds.length < 2) seconds = "0"+seconds;

    return [hours, minutes, seconds];
  }

  getMsDelay(ev) {

    let now = new Date();
    let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ev[0], ev[1]);

    let msDiff = date - now;

    if(msDiff < 0) return 0;
    return msDiff;
  }

  // Converts milliseconds to hours, minutes and seconds
  // Returns an array
  msToTimeUnits(ms) {

    let sec = Math.round(ms/1000);

    let hours = Math.floor(sec/(60*60));
    let minutes = Math.floor((sec-(hours*60*60))/60);
    let seconds = sec-(hours*60*60)-(minutes*60);

    return [hours, minutes, seconds];
  }

}

function volumeProcessor() {
  this.avgTime = 4000; // Time to average (ms)
  this.avgSamples = 40; // Number of samples to take

  this.data = [];
  this.av = null;

  this.storeData = (data) => {
    // Stores data to respect max nb of data samples
    if(this.data.length < this.avgSamples) {
      this.data.push(data);
    } else {
      this.data.shift();
      this.data.push(data);
    }

    // Re-calculates the average
    this.av = this.calcAvgVolume();
  };

  this.calcAvgVolume = () => {
    let total = 0;
    let dataLength = this.data.length;

    // Special cases
    if(dataLength < 1) return 0;
    if(dataLength === 1) return this.data[0];

    // Loop through data
    for(let i = 0; i < dataLength; i++) {
      total += this.data[i];
    }

    return total/dataLength;
  };

  this.getGradient = () => {
    let nb = this.av;
  	let step1 = 25; // Step 1: yellow
  	let step2 = 50; // Step 2: red
  	let inter = step2-step1;

  	if(nb < 0 ) {
  		return 'rgb(0,200,0)';
  	}
  	else if(nb < step1) {
  		// var redLvl = 6*nb;
  		let redLvl = Math.ceil((255/step1)*nb);
  		return 'rgb('+redLvl+',200,0)';
  	}
    else if (nb < step2) {
  		// yellow to red
  		// var greenLvl = 200 - 5*(nb-40);
  		let greenLvl = Math.ceil(200 - ((200/inter)*(nb - inter)));
  		return 'rgb(255,'+greenLvl+',0)';
  	}
    else if (!isFinite(nb)) {
  		// Si on ne reçoit pas de donénes du micro, background noir
  		return 'rgb(0,0,0)';
  	}
    else {
  		// red
  		return 'rgb(255,0,0)';
  	}
  };
}
