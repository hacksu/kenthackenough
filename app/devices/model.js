var mongoose = require('mongoose');
var schema = require('validate');
var gcm = require('node-gcm');

/**
* The Device model
*/
var Device = mongoose.model('Device', {
  type: {type: String, enum: ['android', 'ios', 'chrome']},
  id: String
});

/**
* Validate a device object
* @param Device {type: String, id: String}
* @return An array of error messages
*/
var validate = function (device) {
  var test = schema({
    type: {
      type: 'string',
      required: true,
      message: 'You must provide a device type'
    },
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
var push = function (title, body) {
  Device
    .find()
    .exec(function (err, devices) {
      if (err) return;
      devices.forEach(function (device) {
        var android = [];
        var ios = [];
        var chrome = [];

        if (device.type == 'ios') {
          ios.push(device.id);
        } else if (device.type == 'android') {
          android.push(device.id);
        } else if (device.type == 'chrome') {
          chrome.push(device.id);
        }

        dispatchAndroid(title, body, android);
      });
    });
};

/**

*/
function dispatchIos(id) {

}

/**
* Dispatch a notification to all android devices
* @param title: String
* @param body: String
* @param ids: [String]
*/
function dispatchAndroid(title, body, ids) {

  // Extend array with chunk function
  Array.prototype.chunk = function(chunkSize) {
    var array=this;
    return [].concat.apply([],
      array.map(function(elem,i) {
        return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
      });
    );
  };

  // Split into groups of 1000
  var regIdSets = ids.chunk(1000);

  // Set up the actual notification
  var message = new gcm.Message({
    notification: {
      title,
      body
    }
  });

  // Send the message to each group
  var sender = new gcm.Sender('AIzaSyDYo5zcYvzLdidxYxO4sG1DdLsWelhJqS4');
  regIdSets.forEach(function (regIds) {
    sender.send(message, {registrationIds: regIds}, 10, function (err, result) {
      if (err) return;
    });
  });

}

function dispatchChrome(id) {

}

module.exports = Device;
module.exports.validate = validate;
module.exports.push = push;