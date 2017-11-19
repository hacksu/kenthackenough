'use strict';

let Sponsor = require('./model').Sponsor;
let Benefits = require('./model').Benefits;

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
    
  },

  newPurchase: (req, res) => {
    new Benefits(req.body).save((err, benefit) => {
      if (err) throw err;
      else console.log("ok");
    })
  },

  sponsorBenefits: (req, res) => {
    Benefits.find()
    .exec((err, benefits) => {
      res.send(benefits);
    });
  }
};