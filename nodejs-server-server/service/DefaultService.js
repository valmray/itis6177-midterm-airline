'use strict';


/**
 * delete a passenger
 *
 * id String Passenger id
 * returns GeneralResponse
 **/
exports.delPassenger = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "success" : 0.80082819046101150206595775671303272247314453125,
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * get passengers
 *
 * returns GetPassengersListResponse
 **/
exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "passengers" : [ {
    "seat" : "seat",
    "name" : "name",
    "id" : "id",
    "age" : 0.80082819046101150206595775671303272247314453125
  }, {
    "seat" : "seat",
    "name" : "name",
    "id" : "id",
    "age" : 0.80082819046101150206595775671303272247314453125
  } ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * get a passenger
 *
 * id String 
 * returns GetPassengerResponse
 **/
exports.getOne = function(id) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "seat" : "seat",
  "name" : "name",
  "id" : "id"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * add a new passenger to the list
 *
 * title Passenger Passenger properties
 * returns GeneralResponse
 **/
exports.save = function(title) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "success" : 0.80082819046101150206595775671303272247314453125,
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * update a passenger
 *
 * id String Passenger id
 * title Passenger Passenger properties
 * returns GeneralResponse
 **/
exports.update = function(id,title) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "success" : 0.80082819046101150206595775671303272247314453125,
  "description" : "description"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

