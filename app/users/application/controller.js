'use strict';

let User = require('../model');
let Application = require('./model');
let Email = rootRequire('app/emails/model');
let socket = rootRequire('app/helpers/socket');
let io = socket('/users/application', ['admin', 'staff']);
let extend = require('extend');
let multiparty = require('multiparty');
let fs = require('fs');
let path = require('path');
let uuid = require('uuid');
let projectRoot = require('../../../app').projectRoot;
let config = require('../../../config/config');
let mv = require('mv');
const formidable = require('formidable');
require('os').tmpDir = require('os').tmpdir;

let RegisteredEmail = fs.readFileSync(__dirname + '/templates/registrationTemplate.html').toString();

module.exports = {

  /**
  * Create an application
  * POST /users/application
  * Auth
  */
  create: (req, res) => {
    User
      .findById(req.user._id)
      .select('email application role created')
      .exec((err, user) => {
        if (err) return res.internalError();
        try { if (user.application) return res.clientError('You have already submitted an application', 409); } catch(e) { };
        let errors = Application.validate(req.body);
        if (errors.length) return res.multiError(errors, 400);
        extend(req.body, {
          status: Application.Status.PENDING,
          going: false,
          checked: false,
          door: false
        });
        if (req.body.dietary) req.body.dietary = req.body.dietary.split('|');

		if (user == null) {
			console.log("No user was defined...");
			return res.clientError('An error occured. No User was defined...? umm.....', 409);
		}
        new Application(req.body).save((err, application) => {
          if (err) return res.internalError();
          user.application = application._id;
          user.save((err, user) => {
            if (err) res.internalError();

            if (process.env.NODE_ENV == 'production') {
              let email = new Email({
                subject: 'Your Kent Hack Enough Application',
                body: RegisteredEmail, //'# Thanks for applying to Kent Hack Enough!\nWe appreciate your interest.',
                recipients: {
                  emails: [user.email]
                }
              });
              email.send(false);
            }

            let response = {
              _id: user._id,
              email: user.email,
              role: user.role,
              created: user.created,
              application: application
            };
            io.emit('create', response);
            return res.status(201).json(response);
          });
        });
      });
  },

  /**
  * Get the logged in user with their application
  * GET /users/me/application
  * Auth
  */
  getMe: (req, res) => {
    User
      .findById(req.user._id)
      .select('email application role created')
      .populate('application')
      .exec((err, user) => {
        if (err) return res.internalError();
        return res.status(200).json(user);
      });
  },

  /**
  * Get a list of users with their applications
  * GET /users/application
  * Auth -> admin, staff
  */
  list: (req, res) => {
    User
      .find()
      .select('email application role created')
      .populate('application')
      .exec((err, users) => {
        if (err) return res.internalError();
        return res.status(200).json({users: users});
      });
  },

  /**
  * Get a user by ID with their application
  * GET /users/:id/application
  * Auth -> admin, staff
  */
  find: (req, res) => {
    User
      .findById(req.params.id)
      .select('email application role created')
      .populate('application')
      .exec((err, user) => {
        if (err) return res.internalError();
        return res.status(200).json(user);
      });
  },

  /**
  * Partially update the logged in user's application
  * PATCH /users/me/application
  * Auth
  */
  patch: (req, res) => {
    let errors = Application.validate(req.body);
    if (errors.length) return res.multiError(errors, 400);
    if (req.body.dietary) {
      req.body.dietary = req.body.dietary.split('|');
    } else {
      req.body.dietary = [];
    }
    User
      .findByIdAndUpdate(req.user._id)
      .select('email application role created')
      .exec((err, user) => {
        if (err) return res.internalError();
        Application
          .findByIdAndUpdate(user.application, req.body, {new: true})
          .exec((err, application) => {
            let response = {
              _id: user._id,
              email: user.email,
              role: user.role,
              created: user.created,
              application: application
            };
            io.emit('update', response);
            return res.status(200).json(response);
          });
      });
  },

  /**
  * Partially update a user's application by ID
  * PATCH /users/:id/application
  * Auth -> admin, staff
  */
  patchById: (req, res) => {
    if (req.body.dietary) req.body.dietary = req.body.dietary.split('|');
    User
      .findById(req.params.id)
      .select('email application role created')
      .exec((err, user) => {
        if (err) return res.internalError();
        if (user.application) {
          Application
            .findByIdAndUpdate(user.application, req.body, {new: true})
            .exec((err, application) => {
              if (err) return res.internalError();
              if (req.body.status == Application.Status.APPROVED) {
                var template = fs.readFileSync('app/users/application/templates/acceptedTemplate.html', 'utf8');

                // Send acceptance email
                new Email({
                  subject: 'You\'ve been accepted to KHE!',
                  body: template,
                  recipients: {
                    emails: [user.email]
                  }
                }).send();
              } else if (req.body.status == Application.Status.WAITLISTED) {
                var template = fs.readFileSync('app/users/application/templates/waitlistTemplate.html', 'utf8');

                // Send waitlist email
                new Email({
                  subject: 'You have been waitlisted',
                  body: template, //'Hello,\n\nYou have been added to the Kent Hack Enough waitlist. Please standby for further emails, as we will try to accomodate as many hackers from the waitlist as we can. \n\n\n\nRegards,\n\nKent Hack Enough Team',
                  recipients: {
                    emails: [user.email]
                  }
                }).send();
              } else if (req.body.status == Application.Status.DENIED) {
                // Send denial email
                new Email({
                  subject: 'KHE Status: Denied',
                  body: 'Hello,\n\nWe\'re sorry to say that you have been denied from Kent Hack Enough. We are trying to accomodate as many hackers as we can, but we just can\'t fit everyone in our venue. Thank you so much for your interest, and please come again next year! \n\n\n\nRegards,\n\nKent Hack Enough Team',
                  recipients: {
                    emails: [user.email]
                  }
                }).send();
              }

              if (req.body.checked) {
                var template = fs.readFileSync('app/users/application/templates/dayOfTemplate.html', 'utf8');


                // Send email with day-of information
                new Email({
                  subject: 'Welcome to Kent Hack Enough!',
                  body: template,
                  recipients: {
                    emails: [user.email]
                  }
                }).send();
              }

              let response = {
                _id: user._id,
                email: user.email,
                role: user.role,
                created: user.created,
                application: application
              };
              io.emit('update', response);
              return res.status(200).json(response);
            });
        } else {
          let application = new Application(req.body);
          application.save((err, application) => {
            user.application = application;
            user.save((err, user) => {
              if (err) return res.internalError();
              let response = {
                _id: user._id,
                email: user.email,
                role: user.role,
                created: user.created,
                application: application
              };
              io.emit('update', response);
              return res.status(200).json(response);
            });
          });
        }
      });
  },

  /**
  * Delete the logged in user's application
  * DELETE /users/me/application
  * Auth
  */
  delete: (req, res) => {
    User
      .findById(req.user._id)
      .select('application')
      .exec((err, user) => {
        if (err) return res.internalError();
        Application
          .findByIdAndRemove(user.application)
          .exec((err) => {
            if (err) return res.internalError();
            let response = {_id: req.user._id};
            io.emit('delete', response);
            return res.status(200).json(response);
          });
      });
  },

  /**
  * Delete a user's application by ID
  * DELETE /users/:id/application
  * Auth -> admin, staff
  */
  deleteById: (req, res) => {
    User
      .findById(req.params.id)
      .select('application')
      .exec((err, user) => {
        if (err) return res.internalError();
        Application
          .findByIdAndRemove(user.application)
          .exec((err) => {
            if (err) return res.internalError();
            let response = {_id: req.params.id};
            io.emit('delete', response);
            return res.status(200).json(response);
          });
      });
  },

  /**
  * Upload a resume
  * POST /users/application/resume
  */
  uploadResume: (req, res) => {
    let fileData = [];
    req.on('data', data => {
      fileData.push(data);
    });
    req.on('end', () => {
      fileData = Buffer.concat(fileData);
      let boundary = req.get('content-type').split('; boundary=').pop();
      let hexb = Buffer.from('\n--' + boundary, 'utf8').toString('hex');
      let hexnl = Buffer.from('\r\n\r\n', 'utf8').toString('hex');
      let hexfd = fileData.toString('hex');
      let stuff = hexfd.split(hexnl);
      let info = stuff.shift();
      hexfd = stuff.join(hexnl);
      info = Buffer.from(info, 'hex').toString('utf8');
      let ext = path.extname(info.split('filename="').pop().split('"')[0]);
      let name = uuid.v4();
      let dest = path.join(projectRoot, '/' + config.resumeDir + name + ext);
      fs.writeFile(dest, Buffer.from(hexfd.split(hexb)[0], 'hex'), function(err) {
        if (err) {
          res.status(500).send('Upload Failed');
          throw err;
          return;
        }
        return res.status(200).json({
          filename: name + ext
        });
      })
      
    })
    // let form = new multiparty.Form();
    // form.parse(req, (err, fields, files) => {
    //   Object.keys(fields).forEach(function(name) {
    //     console.log('got field named ' + name);
    //   });
    //   console.log('uhh', files);
    //   console.log(req.get('content-length'))
    //   if (err || !files.resume) return res.singleError('Resume file required', 400);
    //   if (err) return res.internalError();
    //   let ext = path.extname(files.resume[0].path);
    //   let name = uuid.v4();
    //   let dest = path.join(projectRoot, '/' + config.resumeDir + name + ext);
    //   mv(files.resume[0].path, dest, {
    //     mkdirp: true,
    //     clobber: true
    //   }, (err) => {
    //     if (err) {
    //       return res.status(500);
    //       throw err;
    //     }
    //     return res.status(200).json({
    //       filename: name + ext
    //     });
    //   });
    // });
  },

  /**
  * Retreive a resume
  * GET /users/application/resume/:filename
  */
  getResume: (req, res) => {
    let file = path.join(__dirname, '../../../resumes', req.params.filename);
    res.download(file);
  },

  getName: (req, res) => {
    let uId = req.params.uId;
    
    User
    .findById(uId, (err, user) => {
      if (err || !user)  return res.internalError();

      Application
      .findById(user.application, (err, app) => {
        if (err || !app) return res.internalError();

        res.send(app.name);
      })
    })
  }

};
