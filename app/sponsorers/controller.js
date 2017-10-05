'use strict';

let Sponsorer = require('./model');

module.exports = {
  
  allSponsorers: (req, res) => {
    Sponsorer.find()
    .exec((err, spons) => {
        res.send(spons);
    });
  },
  
  getSponsorer: (req, res) => {
    Sponsorer.findById(req.params.id)
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