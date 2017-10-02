'use strict';

let Gamify = require('./model');
let User = require('../users/model');

module.exports = {

  leaderboard: (req, res) => {
    Gamify.find()
    .exec((err, leaderboard) =>
    {
      res.send(leaderboard);
    });
  },

  addPoints: (req, res) => {    

    let points = {
      userID: req.user._id,
      points: req.params.points,
      sponsorerID: req.params.src,
      reason: req.params.reason,
      pointID: req.params.pid
    };

    if (!Gamify.validate(points))
    {
      res.send('invalid input');
      return;
    }
    new Gamify(points).save((err, p) => {
      res.send('ok');
    });
  },
};