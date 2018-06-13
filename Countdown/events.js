
class Events {
  constructor() {

  }

  initList() {
    // Check QS
    let params = this.getQueryStringParams();
    if(params.length > 0) this.validateQSParams(params);
    // TODO Check LocalStorage
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
    console.log(validParams);
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

  // Returns an array if valid date string
  validateQStarget(str) {
    let result = [];

    let parts = str.split(":");
    let nbParts = parts.length;

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
      // If there's more than 3 values, stop the iteration
      else return result;
    }
    return result;
  }
}
