'use strict';

let Sponsor = require('./model');
let mv = require('mv');
let ObjectId = require('mongoose').Types.ObjectId;
let multiparty = require('multiparty');
let config = require('../../config/config');
let path = require('path');
let projectRoot = require('../../app').projectRoot;

module.exports = {

  allSponsors: (req, res) => {
    Sponsor
    // Exclude the logo because it contains a server path.
    .find({ }, { logo:0 })
    .sort({"amount": -1})
    .exec((err, spons) => {
        res.send(spons);
    });
  },
  
  getSponsor: (req, res) => {
    Sponsor
    // Exclude the logo because it contains a server path.
    .findOne({_id: ObjectId(req.params.id)}, { logo:0 })
    .exec((err, spons) => {
        res.send(spons);
    });
  },

  getLogo: (req, res) => {
    var id = req.params.id;      
    Sponsor
    .findOne({_id: ObjectId(req.params.id)})
    .select('logo -_id')
    .exec((err, spons) => {

      // Handle database errors.
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      else if (!spons){
        res.sendStatus(404)
        return;
      }

      // Try to send the image if it exists.
      if (spons.logo) {
        res.sendFile(spons.logo);
      } else {
        res.sendStatus(404);
      }
    });
  },
  
  putLogo: (req, res) => {
    let img = new multiparty.Form();
    img.parse(req, (err, fields, files) =>
    {
      if (err) {
        res.sendStatus(500);
        throw err;
      }

      var logo = files.file[0];
      // Create the logo file from the sponsor 
      // name because that must be unique.
      var logoPath = projectRoot + '/'
                    + config.logoDir 
                    + fields['sponsor[name]'][0]
                    + path.extname(logo.originalFilename);

      // Move the file out of /tmp/
      mv(logo.path, logoPath, {
        mkdirp: true,
        clobber: true
      }, (err) => {

        if (err) {
          res.sendStatus(500);
          throw err;
        }

        // Save the updated file location in the database.
        Sponsor.update({_id: req.params.id }, {$set: {
          logo: logoPath
        }}, (err, data) => {
          if (err) {
            res.sendStatus(500);
            throw err;
          }
          res.sendStatus(200);
        });

      });
    });     
  },

  add: (req, res) => {

    let errors = Sponsor.validate(req.body);

    if (errors.length) return res.multiError(errors, 400);

    new Sponsor(req.body)
    .save((err, data) => {
      if (err) console.log(err);
      else console.log('added');
    });
    res.send(req.body)
  },

  remove: (req, res) => {
    Sponsor
    .remove({_id: req.params.id}, (err, data) =>{
      if (err)
      {
        console.log(err);
        res.sendStatus(500);
      } 
      else res.sendStatus(200);
    });
  },

  update: (req, res) => {
    Sponsor
    .update({_id: req.params.id }, {$set: {
        name: req.body.name,
        link: req.body.link,
        amount: req.body.amount
      }}, (err, data) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        }
        else res.sendStatus(200);
      });
  }
};