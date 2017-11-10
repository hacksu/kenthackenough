'use strict';

let Sponsor = require('./model');

module.exports = {
  
  allSponsors: (req, res) => {
    Sponsor.find()
    .exec((err, spons) => {
        res.send(spons);
    });
  },
  
  getSponsor: (req, res) => {
    Sponsor.findById(req.params.id)
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