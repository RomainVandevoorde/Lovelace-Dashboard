
class Event {
  constructor(data) {
    this.title = data.title || "Anon"; // Display name in the UI
    this.date = data.date || new Date();
    this.description = data.description || "";

    this.after = {};
    this.after.time = 30; // How long the event will be displayed after it is finished
    this.after.message = ""; // Will be displayed when event is over
  }
}

class Events {
  constructor() {
    this.list = [];
    // this.storage = window.localStorage;
    // this.initStorage();
  }

  // Checks QueryString and LocalStorage to initiate events
  // Execute at page load
  initList() {
    // Pushes QS events in the list
    this.addQSEvents();
    // TODO Check LocalStorage
    // console.log(this.list);
    // let jsonlist = JSON.stringify(this.list);
    // console.log(jsonlist);
    // console.log(JSON.parse(jsonlist));
  }

  initStorage() {
    if (!this.storage.events) {
      console.log("nope");
      window.localStorage.setItem('events', "{}");
      console.log(window.localStorage.events);
    }
  }

  addEvent2(data) {
    let ev = new Event(data);
    console.log(ev);
    this.list.push(ev);
  }

  // Validates and adds an event to the list
  // addEvent(ev) {
  //   if(ev.isArray()) {
  //     // Event is a hour:min:sec array (target)
  //     let cleaned = this.cleanTarget(ev);
  //     let ts = this.targetToTimestamp(cleaned);
  //     let validTs = this.cleanTimestamp(ts);
  //     if(validTs !== 0) this.list.push(validTs);
  //   }
  //   else if(typeof ev === "number") {
  //     // Event is a timestamp
  //     let cleaned = this.cleanTimestamp(ev);
  //     if(cleaned !== 0) this.list.push(cleaned);
  //   }
  //   else console.log(typeof ev);
  // }

  getNextEvent() {
    let len = this.list.length;
    let eventIndex = null;
    let eventDiff = null;

    for(let i = 0; i < len; i++) {
      let ev = this.list[i];
      let now = new Date();

      let diff = ev.date - now;
      console.log(diff);

      if(diff < 0) continue;

      console.log("ok");

      if(eventIndex === null || diff < eventDiff) {
        console.log("new diff: "+diff);
        eventIndex = i;
        eventDiff = diff;
      }
    }

    console.log("Next event: "+eventDiff+"("+eventIndex+")");
  }

  getTableList() {
    let len = this.list.length;
    let tbody = document.createElement('tbody');

    if(len === 0) {
      tbody.innerHTML = "<tr><td>No events to show</td></tr>";
      return tbody;
    }

    for(let i = 0; i < len; i++) {

      let obj = this.list[i];
      let row = document.createElement('tr');
      let data = [obj.title, obj.date];

      for(let prop in data) {
        let cell = document.createElement('td');
        let text = document.createTextNode(data[prop]);
        cell.appendChild(text);
        row.appendChild(cell);
      }

      let actionsCell = document.createElement('td');
      actionsCell.innerHTML = '<i class="fa fa-trash"></i>  <i class="fa fa-edit"></i>';

      row.appendChild(actionsCell);

      tbody.appendChild(row);

    }

    return tbody;

  }

  targetToDateObject(target) {
    let now = new Date();
    let date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), target[0], target[1] || 0, target[2] || 0);
    return date;
  }

  timestampToDateObject(ts) {
    let date = new Date(ts);
    console.log(date);
  }

  targetToTimestamp(target) {
    let now = new Date();
    let timestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate(), target[0], target[1] || 0, target[2] || 0);
    return timestamp.getTime();
  }

  cleanTimestamp(ts) {
    ts = parseInt(ts);
    if(ts > Date.now()) return ts;
    else return 0;
  }

  // Goes through the Query String to add new events
  addQSEvents() {
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search.slice(1));

    for(let pair of params.entries()) {
      // Validate and push targets
      if(pair[0] === "target") {
        let tgt = this.cleanTarget(pair[1].split(":"));
        if(tgt.length === 0) continue;
        let date = this.targetToDateObject(tgt);
        // let ts = this.targetToTimestamp(tgt);
        // let validTs = this.cleanTimestamp(ts);
        // if(validTs !== 0) this.list.push(validTs);
        let ev = new Event({date:date, title:"Query"});
        this.list.push(ev);
      }
      else if(pair[0] === "ts") {
        let ts = this.cleanTimestamp(pair[1]);
        // this.list.push(ts);
        let date = this.timestampToDateObject(ts);
        // console.log(date);
      }
      else console.log("Unknown param : "+pair[0]+" - "+pair[1]);
    }
  }

  // Returns a valid target array (h:m:s)
  cleanTarget(tgt) {
    let result = [];

    let parts = tgt; // TODO rewrite variables

    let nbParts = parts.length;

    // Go through each part of the array
    for(let i = 0; i < nbParts; i++) {
      let value = parseInt(parts[i]);
      // Validate hours
      if(i === 0) {
        if(value >= 0 && value < 24) result.push(value);
        else return [];
      }
      // Validate minutes/seconds
      else if(i === 1 || i === 2) {
        if(value >= 0 && value < 60) result.push(value);
        else result.push(0);
      }
      // If there's more than 3 values, return what we got
      else return result;
    }
    return result;
  }
}
