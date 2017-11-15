'use strict';

let Sponsor = require('./model');

module.exports = {
  
  allSponsors: (req, res) => {
    Sponsor.find().sort({"amount": -1})
    .exec((err, spons) => {
        res.send(spons);
    });
  },
  
  getSponsor: (req, res) => {
    Sponsor.find({amount: req.params.id})
    .exec((err, spons) => {
        res.send(spons);
    });
  },

  getLogo: (req, res) => {
    var id = req.params.id;      
      res.send(id);
  },
  
  putLogo: (req, res) => {
    
  }
};