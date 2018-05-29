window.onload = () => {

  menu = new eventsMenu();

  window.setInterval(countdown, 1000);

};



countdown = () => {

  const input = document.getElementsByTagName('input')[0];
  const display = document.getElementsByTagName('h2')[0];

  const targetTime = validInput(input.value);
  const cdSeconds = secondDiff(targetTime);

  display.innerHTML = secondsToString(cdSeconds);
  menu.getEvents();
};

// Returns a Date object that represents the input time
validInput = (data) => {

  const now = new Date();
  const value = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+"T"+data+":00Z";
  const targetDate = new Date(value);

  return targetDate;

};

secondDiff = (targetDate) => {

  const now = Date.now()+(120*60*1000);
  const msDiff = targetDate - now;

  return Math.round(msDiff/1000);

};

secondsToString = (data) => {

  // console.log(data/(60*60));
  let hours = Math.floor(data/(60*60));
  let minutes = Math.floor((data-(hours*60*60))/60);
  let seconds = data-(hours*60*60)-(minutes*60);

  return hours+"h "+minutes+"m "+seconds+"s";

};


class eventsMenu {

  constructor() {
    this.mainContainer = document.getElementById('eventsMenu');
  }

  getEvents() {
    let eventsArray = [];

    let events = this.mainContainer.getElementsByClassName('event');
    // For each event
    for(let i = 0; i < events.length; i++) {
      let values = events[i].getElementsByTagName('input');
      let text = events[i].getElementsByTagName('textarea');
      eventsArray.push([values[0].checked, values[1].value, values[2].value, text[0].value]);
    }

    eventsArray = this.validateEvents(eventsArray);

    return eventsArray;
  }

  // Takes in an array of events and checks wether or not each one is valid
  validateEvents(array) {

    let eventsArray = [];

    // Go through the array and validate each event
    for (let i = 0; i < array.length; i++) {
      let ev = this.validateEvent(array[i]);
      if(ev.length !== 0) eventsArray.push(ev);
    }

    console.log(eventsArray.length);
    return eventsArray;
  }

  // Validates events. Returns an empty array if any data is invalid
  validateEvent(array) {
    // First element should be a bool
    if(typeof array[0] !== "boolean") return [];

    // Second element should be a valid int and hour
    let hour = parseInt(array[1]);
    if(!Number.isInteger(hour)) return [];
    if(hour < 0 || hour > 24) return [];

    // Third element should be a valid int and minute
    let minute = parseInt(array[2]);
    if(!Number.isInteger(minute)) return [];
    if(minute < 0 || minute > 59) return [];

    // Fourth element should be text
    if(typeof array[3] !== "string") return [];
    if(array[3].length < 1 || array[3].length > 100) return [];

    return [array[0], hour, minute, array[3]];
  }

}
