'use strict';

let Sponsor = require('./model');
let fs = require('fs');
let ObjectId = require('mongoose').Types.ObjectId;
let multiparty = require('multiparty');

module.exports = {
  
  allSponsors: (req, res) => {
    Sponsor.find().sort({"amount": -1})
    .exec((err, spons) => {
        res.send(spons);
    });
  },
  
  getSponsor: (req, res) => {
    Sponsor.findOne({_id: ObjectId(req.params.id)})
    .exec((err, spons) => {
        res.send(spons);
    });
  },

  getLogo: (req, res) => {
    // TODO: get the image back from the database
    var id = req.params.id;      
      res.send(id);
  },
  
  putLogo: (req, res) => {
    // TODO: figure out how to post this to the database
    let img = new multiparty.Form();
    img.parse(req, (err, fields, files) =>
    {
      if (err) throw err;
      console.log(files.img[0].path);
      fs.readFileSync(files.img[0].path);
    }); 
  }
};