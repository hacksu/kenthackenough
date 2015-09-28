'use strict';

let Device = require('./model');

module.exports = {

  /**
  * Subscribe a device to push notifications
  * POST /devices
  */
  post: (req, res) => {
    let errors = Device.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);

    let device = new Device(req.body);
    device.save((err, device) => {
      if (err) return res.singleError('Duplicate device ID', 409);
      return res.status(201).json(device);
    });
  },

  /**
  * Unregister a device
  * DELETE /devices/:id
  */
  delete: (req, res) => {
    Device
      .findOneAndRemove({id: req.params.deviceId})
      .exec((err, device) => {
        if (err || !device) return res.internalError();
        return res.status(200).json({_id: device._id});
      });
  }

};