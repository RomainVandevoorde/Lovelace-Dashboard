window.onload = () => {

  let ui = new UI();
  let countdown = new Countdown();

  // Pass the UI and Countdown objects to the main loop
  window.setInterval(countdownLoop, 100, ui, countdown);

  // Create menu hide/show button
  let menu = document.getElementById('event-menu');

  document.getElementById('show-menu').addEventListener('click', function(){
    console.log('menu');
    if(menu.style.display === 'block') menu.style.display = 'none';
    else menu.style.display = 'block';
  });


  // Create event for activate audio meter button
  document.getElementById('activate').addEventListener('click', function(e){
    this.style.display = 'none';
    let meterObject = new volumeMeter();
    meterObject.createMeter();
    mainLoop(meterObject);
  });

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
    this.addEventBlock = document.getElementById('add-event');
    this.eventListBlock = document.getElementById('events-list');
    this.displayBlock = document.getElementById('countdown');
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

  fillCountdown(info) {
    this.displayBlock.getElementsByTagName('h1')[0].innerHTML = info[0]+':'+info[1]+':'+info[2];
    this.displayBlock.getElementsByTagName('p')[1].innerHTML = info[3];
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
