'use strict';

let mongoose = require('mongoose');
let schema = require('validate');
let gcm = require('node-gcm');
let config = rootRequire('config/config');

/**
* The Device model
*/
let Device = mongoose.model('Device', {
  id: {type: String, unique: true}
});

/**
* Validate a device object
* @param Device {type: String, id: String}
* @return An array of error messages
*/
function validate(device) {
  let test = schema({
    id: {
      type: 'string',
      required: true,
      message: 'You must provide a device ID'
    }
  });
  return test.validate(device);
};

/**
* Push a message to all developers
* @param title: String
* @param body: String
*/
function push(title, body) {
  Device
    .find()
    .exec((err, devices) => {
      if (err) return;
      let ids = devices.map((device) => {
        return device.id;
      });
      dispatch(title, body, ids);
    });
};

/**
* Dispatch a notification to all devices
* @param title: String
* @param body: String
* @param ids: [String]
*/
function dispatch(title, body, ids) {

  // Extend array with chunk function
  Array.prototype.chunk = function (chunkSize) {
    let array=this;
    return [].concat.apply([],
      array.map((elem,i) => {
        return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
      })
    );
  };

  // Split into groups of 1000
  let regIdSets = ids.chunk(1000);

  // Set up the actual notification
  let message = new gcm.Message({
    notification: {
      title: title,
      body: body
    }
  });

  // Send the message to each group
  let sender = new gcm.Sender(config.gcm.apiKey);
  for (let regIds of regIdSets) {
    sender.send(message, {registrationIds: regIds}, 10, (err, result) => {
      if (err) return;
      cleanup(regIds, result);
    });
  }

}

/**
* Clean up bad registrations from the database
* @param regIds
* @param result
*/
function cleanup(regIds, result) {
  if (result.failure > 0) {
    // we have some errors
    // populate a list with bad registration ids
    let toRemove = [];
    for (let resObj of result.results) {
      if ('error' in resObj) {
        toRemove.push(regIds[i]);
      }
    }

    // delete the bad ids from the database
    Device
      .find({id: {$in: toRemove}})
      .remove()
      .exec();
  }
}

module.exports = Device;
module.exports.validate = validate;
module.exports.push = push;