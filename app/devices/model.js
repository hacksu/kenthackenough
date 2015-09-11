var mongoose = require('mongoose');
var schema = require('validate');

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

module.exports = Device;
module.exports.validate = validate;