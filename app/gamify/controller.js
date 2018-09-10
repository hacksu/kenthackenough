'use strict'

let Points = require('./model');
let Sponsor = require('../sponsors/model');
let Users = require('../users/model');
let ObjectId = require('mongoose').Types.ObjectId;

module.exports = {
    scoreboard: (req, res) => {
        Points
        .aggregate([
            // Group point values by user.
            { $group: {
                _id: "$redeemer",
                points: { $sum: '$pointValue'} 
            }},
            // Order decending.
            { $sort: {
                points: -1
            }}
        ])
        .exec((err, points) => {
            if (err) throw err;

            res.status(200);
            res.json(points);
        })
    },

    userPoints: (req, res) => {
        let uId = req.params.userId;
        
        Points
        .aggregate([
            // Find points that belong to this user.
            { $match: { redeemer: ObjectId(uId) }},
            // Sum the point values.
            { $group: {
                _id: ObjectId(uId),
                points: { $sum: '$pointValue'}
            }}
        ])
        .exec((err, points) => {
            if (err) throw res.internalError();

            res.status(200);
            res.json(points);
        })
    },    

    /**
     * Requires url params:
     * sId = sponsor id is in database
     * pVal = point value > 0
     */
    createSingleUse: (req, res) => {
        let sId = req.params.sId;
        let pVal = req.params.pVal;

        if (pVal < 0) {
            res.status(412);
            res.send("Error: Invalid point value")
        }

        Sponsor
        .findOne({ _id: sId }, (err, sponsor) => {
            // sponsor will be null if none are found.
            if (err || !sponsor) {
                res.status(412)
                res.send("Error: Invalid sponsor.")
                return
            }

            new Points({
                sponsor: sId,
                pointValue: pVal
            })
            .save((err, p) => {
                if (err) {
                    res.status(500);
                    res.send(err);
                }

                // saved ok!
                res.status(200);
                res.json(p);
            })
        })
    },    

    createMultiUse: (req, res) => {
        let pVal = req.params.pVal;

        if (pVal < 0) {
            res.status(412);
            res.send("Error: Invalid point value")
        }

        new Points({
            sponsor: null,
            pointValue: pVal
        })
        .save((err, p) => {
            if (err) return res.internalError();

            res.status(200);
            res.send(p);
        })
    },

    redeem: (req, res) => {
        let uId = req.params.userId;
        let pId = req.params.pointId;

        Points
        .findOne({
            _id: ObjectId(pId)
        }, (err, p) => {
            if (err) {
                return res.internalError();
            }

            // Verify the points exist.
            if (!p) {
                res.status(412);
                res.send("Points not found.")
                return
            }

            // Verify the points haven't been given.
            if (p.redeemer) {
                res.status(409)
                res.send("Points already claimed.")
                return
            }

            if (p.sponsor == null) {
                // Multiuse point codes.
                Points
                .count({
                    multiUseRef: pId,
                    redeemer: uId
                }, (err, timesRedeemed) => {
                    if (err) return res.internalError();

                    if (timesRedeemed > 0) {
                        res.status(409)
                        res.send("You already redeemed these points.")
                        return
                    }

                    new Points({
                        redeemer: uId,
                        multiUseRef: pId,
                        sponsor: null,
                        pointValue: p.pointValue
                    })
                    .save((err, cpydPoints) => {
                        if (err) return res.internalError();

                        res.status(200);
                        res.send(cpydPoints);
                    })
                })

            } else {
                // Single use point codes.
                Points
                .update(
                    { _id: pId },
                    { redeemer: ObjectId(uId) },
                    (err, p) => {
                        if (err) {
                            return res.internalError();
                        }
                        res.status(200);
                        res.send("Redeemed!");
                    });
            }
        })
    }
}
