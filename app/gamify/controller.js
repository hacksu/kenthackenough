'use strict'

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
    createSingleUse: (req, res) => {
        console.log("createSingleUse");
        res.status(200);
        res.send("createSingleUse");
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