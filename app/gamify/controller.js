'use strict'

let Points = require('./model');
let Sponsor = require('../sponsors/model')

module.exports = {
    scoreboard: (req, res) => {
        console.log("scoreboard");
        res.status(200);
        res.send("scoreboard");
    },
    userPoints: (req, res) => {
        console.log("userPoints");
        res.status(200);
        res.send("userPoints");
    },    

    /**
     * Requires url params:
     * sId = sponsor id is in database
     * pVal = point value > 0
     */
    createSingleUse: (req, res) => {
        console.log("createSingleUse");
        let sId = req.params.sId;
        let pVal = req.params.pVal;

        console.log("sId", sId);
        console.log("pVal", pVal);

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
        console.log("createMultiUse");
        res.status(200);
        res.send("createMultiUse");
    },
    redeem: (req, res) => {
        console.log("redeem");
        res.status(200);
        res.send("redeem");
    }
}