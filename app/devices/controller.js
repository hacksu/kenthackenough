var router = getRouter();
var Device = require('./model');

/**
* Subscribe a device to push notifications
* POST /devices
*/
router.post('/devices', function (req, res) {
  var errors = Device.validate(req.body);
  if (errors.length) return res.multiError(errors);
  var device = new Device(req.body);
  device.save(function (err, device) {
    if (err) return res.internalError();
    return res.json(device);
  });
});

/**
* Unregister a device
* DELETE /devices/:id
*/
router.delete('/devices/:deviceId', function (req, res) {
  Device
    .findOneAndRemove({id: req.params.deviceId})
    .exec(function (err, device) {
      if (err || !device) return res.internalError();
      return res.json({_id: device._id});
    });
});