
function Timeline() {
  this.defaultTimelineEvents = [];

  this.defaultTimeline = [
    {description : "Début de la journée", hour : 9, minute : 0, holdCountdown : 0, holdText : 0},
    {description : "Pause du matin", hour : 11, minute : 0, holdCountdown : 0, holdText : 0},
    {description : "Pause midi", hour : 12, minute : 30, holdCountdown : 0, holdText : 0},
    {description : "Fin de la pause midi", hour : 13, minute : 30, holdCountdown : 0, holdText : 0},
    {description : "Pause de l'après-midi", hour : 15, minute : 0, holdCountdown : 0, holdText : 0},
    {description : "Fin de la pause du matin", hour : 11, minute : 15, holdCountdown : 60, holdText : 0},
    {description : "Fin de la pause de l'après-midi", hour : 15, minute : 15, holdCountdown : 0, holdText : 0},
    {description : "Fin de la journée", hour : 17, minute : 0, holdCountdown : 0, holdText : 0}
  ];

  for(let e of this.defaultTimeline) {
    e.category = 0; // Cat 0 = defaults
  }

  this.addTimestampToEvents = () => {
    for(let e of this.defaultTimeline) {

      // Skip this if the event already has a valid date
      if(e.date && e.date.getTime) continue;

      // Creates a Date corresponding to this event's values
      let now = new Date();
      let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), e.hour, e.minute);

      // Attributes Date to the event
      e.date = date;
    }
  };

  // Sorts from earliest event to latest event
  this.sortEvents = () => {
    this.defaultTimeline.sort(function(a, b) {
      return a.date.getTime() - b.date.getTime();
    });
  }

  this.init = () => {
    let i = 0;
    for(let event of this.defaultTimeline) {
      let now = new Date();
      let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), event.hour, event.minute);
      if((date.getTime() + event.holdCountdown*1000) > now) this.defaultTimelineEvents.push({id : i, date : date});
      i++;
    }
  };

  this.init();

  this.checkIfEventPassed = () => {

    let now = new Date();
    let nextEvent = this.defaultTimelineEvents[0];
    if((nextEvent.date.getTime() + this.defaultTimeline[nextEvent.id].holdCountdown*1000) < now) this.defaultTimelineEvents.shift();

  };

  this.displayHour = () => {
    let now = new Date();

    let hours = now.getHours().toString();
    let minutes = now.getMinutes().toString();
    let seconds = now.getSeconds().toString();

    if(hours.length < 2) hours = "0" + hours;
    if(minutes.length < 2) minutes = "0" + minutes;
    if(seconds.length < 2) seconds = "0" + seconds;

    return [hours, minutes, seconds];
  };

  this.getUnitsFromMS = (ms) => {
    let absMS = Math.abs(ms);
    let negative = (absMS !== ms);

    let baseSeconds = Math.floor(absMS/1000);

    let hours = (Math.floor(baseSeconds / 3600)).toString();
    let minutes = (Math.floor((baseSeconds - hours * 3600) / 60)).toString();
    let seconds = (baseSeconds - 3600 * hours - 60 * minutes).toString();

    if(hours.length < 2) hours = "0" + hours;
    if(minutes.length < 2) minutes = "0" + minutes;
    if(seconds.length < 2) seconds = "0" + seconds;

    if(negative) hours = "-" + hours;

    return [hours, minutes, seconds];
  };

  this.getCountdown = () => {
    // Remove first event in array if it's done
    this.checkIfEventPassed();
    // console.log(this.defaultTimelineEvents);
    // Si il n'y a plus d'events, return hour
    if(this.defaultTimelineEvents.length === 0) return this.displayHour();

    return this.getUnitsFromMS(this.defaultTimelineEvents[0].date - Date.now());
  };
}

let timeline = new Timeline();

// window.setInterval(function() {
//   let content = timeline.getCountdown();
//   document.getElementsByTagName('h1')[0].innerHTML = content[0] + ":" + content[1] + ":" + content[2];
// }, 100);

timeline.addTimestampToEvents();
timeline.sortEvents();
console.log(timeline.defaultTimeline);
