'use strict';

let Gamify = require('./model');
let User = require('../users/model');
let Application = require('../users/application/model');
let ObjectId = require('mongoose').Types.ObjectId;

let codeDict = require('./validCodes');

module.exports = {
  leaderboard: (req, res) => {
    Gamify
    .aggregate([
      // 1. Find all entries in table.
      {$match: { }},
      // 2. Put all the points for a user in an array.
      {$group:{
        _id: '$userID',
        email: { $first: '$email' },
        pointsItems: {$push: {points: '$points'}}}
      },
      // 3. Remove items from the array for doing the sum.
      {$unwind: '$pointsItems'},
      // 4. Add all the points for user.
      {$group: {
        _id: '$_id' , // This is the userID
        email: { $first: '$email'},
        points: {$sum: '$pointsItems.points'}}
      },
      // 5. Sort in from highest score to lowest score.
      {$sort: {
          points: -1
        }
      }])
    .exec((err, leaderboard) =>
    {
      if (err)
      {
        res.send(err);
        throw err;
      } 
      else
      {
        res.send(leaderboard);
      }
    });    
  },

  sponsorPoints: (req, res) => {
    var sponsorId = req.params.sid
    if (!sponsorId) {
      res.status(400)
      res.send("No sponsor id included.")
      return 
    }
    console.log(sponsorId)

    var codes = []
    for (var code in codeDict) {
      console.log(codeDict[code])
      if (codeDict[code].sponsorID === sponsorId) {
        // Replace point ID with code for redeeming
        codes.push({
          pointID: code,
          name: codeDict[code].reason
        })
      }
    }

    res.status(200)
    res.send(codes)
  },


  // /gamify/:pid/:reason/:sid/:uid
  // sID just needs to check out with the file, not actually confirmed in DB, can use 'hacksu' for hackathon events
  // reason can be input by the company. (ie. star resume)
  addPoints: (req, res) => {    

    if (!(req.params.pid in codeDict)) {
      res.status(400);
      res.send('Invalid point id.')
      return;
    }
    let raw_points = codeDict[req.params.pid];

    // Verify sponsor id matches
    if (req.params.sid !== raw_points.sponsorID) {
      res.status(400)
      res.send('Invalid sponsor.')
      return
    }

    let points = {
      pointID: raw_points.pointID,
      points: raw_points.points,
      sponsorID: raw_points.sponsorID,
      reason: raw_points.reason
    }
    points.userID = req.params.uid


    Application
    .findById(points.userID)
    .exec((err, app) => {
      if (err || !app) {
        res.status(404)
        res.send("User not found.")
        return
      }

      points.email = app.name

      if (!Gamify.validate(points))
      {
        res.status(400)
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
        console.log("error", err)
          if (err) {
              res.status(400);
              res.send(err.message);
              return
          }
          if (cnt <= 0)
          {
            Gamify(points).save((err, p) => {
              res.status(200)
              res.send('Points Redeemed!');
              return
            });
          }
          else
          {
            res.status(409);
            res.send('Points already redeemed.')
            return
          }
      });
    })
  },
}; 