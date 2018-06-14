
class Events {
  constructor() {
    this.list = [];
  }

  // Checks QueryString and LocalStorage to initiate events
  // Execute at page load
  initList() {
    // Pushes QS events in the list
    this.addQSEvents();
    // TODO Check LocalStorage
    console.log(this.list);
  }

  // Validates and adds an event to the list
  addEvent(ev) {
    if(ev.isArray()) {
      // Event is a hour:min:sec array (target)
      let cleaned = this.cleanTarget(ev);
      let ts = this.targetToTimestamp(cleaned);
      let validTs = this.cleanTimestamp(ts);
      if(validTs !== 0) this.list.push(validTs);
    }
    else if(typeof ev === "number") {
      // Event is a timestamp
      let cleaned = this.cleanTimestamp(ev);
      if(cleaned !== 0) this.list.push(cleaned);
    }
    else console.log(typeof ev);
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
        let tgt = this.cleanTarget(pair[1]);
        let ts = this.targetToTimestamp(tgt);
        let validTs = this.cleanTimestamp(ts);
        if(validTs !== 0) this.list.push(validTs);
      }
      else if(pair[0] === "ts") {
        let ts = this.cleanTimestamp(pair[1]);
        this.list.push(ts);
      }
      else console.log("Unknown param : "+pair[0]+" - "+pair[1]);
    }
  }

  getQSEvents() {
    let params = this.getQueryStringParams();
    if(params.length > 0) params = this.validateQSParams(params);
    else {
      console.log("no valid params");
      return;
    };
    console.log(params);
  }

  getQueryStringParams() {
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search.slice(1));

    let validParams = [];

    for(let pair of params.entries()) {
      if(pair[0] === "target")     validParams.push({"target" : pair[1]});
      else if(pair[0] === "timer") validParams.push({"timer" : pair[1]});
      else if(pair[0] === "ts")    validParams.push({"timestamp" : pair[1]});
      else console.log(pair[0]+" : "+pair[1]);
    }
    return validParams;
  }

  validateQSParams(params) {
    let len = params.length;
    let validTargets = [];
    let validTimestamps = [];

    for(let i = 0; i < len; i++) {
      if(params[i].target) {
        let cleanedQS = this.validateQStarget(params[i].target);
        if(cleanedQS.length > 0) validTargets.push(cleanedQS);
      }
      if(params[i].timer) {
        // TODO Validate timer
      }
      if(params[i].timestamp) {
        let ts = parseInt(params[i].timestamp);
        if(ts > Date.now()) validTimestamps.push(ts);
      }
    }

    console.log([validTargets, validTimestamps]);
    return [validTargets, validTimestamps];
  }

  // Returns a valid target array (h:m:s)
  cleanTarget(tgt) {
    let result = [];
    let parts = [];

    // Creates an array if we received a string
    if(typeof tgt === "string") parts = tgt.split(":");
    else if(typeof tgt === "object") parts = tgt;

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
