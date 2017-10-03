'use strict';

let Gamify = require('./model');
let User = require('../users/model');
let Application = require('../users/application/model');

module.exports = {

  leaderboard: (req, res) => {
    Gamify.find()
    .populate('userID')
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
      console.log('invalid input');
      res.send('invalid input');
      return;
    }

    Gamify
    .find({ 
      userID: points.userID,
      pointID: points.pointID
    })
    .count()
    .exec((err, cnt) => {
        console.log(cnt);
        if (cnt <= 0)
        {
          Gamify(points).save((err, p) => {
            res.send('ok');
          });
        }
    });
  },
};