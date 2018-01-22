'use strict';

let Sponsor = require('./model');
let mv = require('mv');
let ObjectId = require('mongoose').Types.ObjectId;
let multiparty = require('multiparty');
let config = require('../../config/config');
let path = require('path');
let projectRoot = require('../../app').projectRoot;
let fs = require('fs');

module.exports = {

  allSponsors: (req, res) => {
    Sponsor
    // Exclude the logo because it contains a server path.
    .find({ }, { logoPath:0 })
    .sort({"amount": -1})
    .exec((err, spons) => {
        res.send(spons);
    });
  },
  
  getSponsor: (req, res) => {
    Sponsor
    // Exclude the logoPath because it contains a server path.
    .findOne({_id: ObjectId(req.params.id)}, { logoPath:0 })
    .exec((err, spons) => {
        res.send(spons);
    });
  },

  getLogo: (req, res) => {
    var id = req.params.id;      
    Sponsor
    .findOne({_id: ObjectId(req.params.id)})
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
      if (spons.logoPath) {
        res.sendFile(spons.logoPath);
      } else {
        res.sendStatus(404);
      }
    });
  },
  
  putLogo: (req, res) => {
    var id = req.params.id;      
    Sponsor
    .findOne({_id: ObjectId(req.params.id)})
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
                      + spons._id.toString()
                      + path.extname(logo.path);

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
            logoPath: logoPath
          }}, (err, data) => {
            if (err) {
              res.sendStatus(500);
              throw err;
            }
            res.sendStatus(200);
          });

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
      else  res.send(data);
    });
  },

  remove: (req, res) => {
    var id = req.params.id;      
    Sponsor
    .findOne({_id: ObjectId(req.params.id)})
    .exec((err, sponsor) => {
      if (err) {
        res.sendStatus(500);
        throw err;
      }
      else if (!sponsor){
        res.sendStatus(404)
        return;
      }
      Sponsor
      .remove({_id: req.params.id}, (err, data) =>{
        if (err)
        {
          console.log(err);
          res.sendStatus(500);
        } 
        else {
          fs.unlink(sponsor.logoPath, (err) => {
            if (err) throw err;
            res.sendStatus(200);
          })
        }
      });
    });
  },

  update: (req, res) => {
    let errors = Sponsor.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);
    
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
        else if (data.nModified == 1) {
          res.sendStatus(200);
        } else {
          res.sendStatus(404);
        }
      });
  }
};