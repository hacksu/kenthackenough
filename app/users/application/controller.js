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
        if (user.application) return res.clientError('You have already submitted an application', 409);
        let errors = Application.validate(req.body);
        if (errors.length) return res.multiError(errors, 400);
        extend(req.body, {
          status: Application.Status.PENDING,
          going: false,
          checked: false,
          door: false
        });
        if (req.body.dietary) req.body.dietary = req.body.dietary.split('|');

        new Application(req.body).save((err, application) => {
          if (err) return res.internalError();
          user.application = application._id;
          user.save((err, user) => {
            if (err) res.internalError();

            if (process.env.NODE_ENV == 'production') {
              let email = new Email({
                subject: 'Your Kent Hack Enough Application',
                body: '# Thanks for applying to Kent Hack Enough!\nWe appreciate your interest.',
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
                // Send acceptance email
                new Email({
                  subject: 'You\'ve been accepted to KHE!',
                  body: '## You\'re invited!\n\n\nCongratulations, you have been accepted to Kent Hack Enough. Please RSVP here: [khe.io/rsvp](https://khe.io/rsvp).\n\n\nUntil then, a few things to note:\n\n\n**What you should bring:**\n- Deodorant\n- Laptop and charger\n- Valid school ID\n- Phone/charger\n- Change of clothes\n- Deodorant\n- Basic toiletries\n- Pillow and blanket\n- Deodorant\n\n\n**Hackers looking for travel reimbursements:** Please submit a request on the contact form of [our website](https://khe.io) and we\'ll get back to you. Hackers may receive travel reimbursement on a first come first serve basis.\n\n\n**Hackers under the age of 18:** Please have a parent/guardian sign our minor waiver [go.khe.io/waiver](http://go.khe.io/waiver) and return that to us at [staff@khe.io](mailto:staff@khe.io) before the event.\n\n\n**Make sure your resume is attached to your application if you\'re looking for full time jobs or internships.** You can edit your application by logging in at [khe.io](https://khe.io)\n\n\nWe\'re looking forward to seeing you on October 9th!\n\n\n\nRegards,\n\nKent Hack Enough Team',
                  recipients: {
                    emails: [user.email]
                  }
                }).send();
              } else if (req.body.status == Application.Status.WAITLISTED) {
                // Send waitlist email
                new Email({
                  subject: 'You have been waitlisted',
                  body: 'Hello,\n\nYou have been added to the Kent Hack Enough waitlist. Please standby for further emails, as we will try to accomodate as many hackers from the waitlist as we can. \n\n\n\nRegards,\n\nKent Hack Enough Team',
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
                // Send email with day-of information
                new Email({
                  subject: 'Welcome to Kent Hack Enough!',
                  body: "# Welcome to Kent Hack Enough!\nWe're so glad you're here. Please take the time to read this over for some important information you'll need during the event.\n### Wristbands and Photo ID\nPlease wear your wristbands at all times. You will only be permitted to take food/drinks/snacks if you are wearing your wristband. Also, if you leave the building at any time during the event, be sure to **bring your photo ID with you**. Security will not allow you back into the event unless you have a valid photo ID.\n### Event WiFi\nEvent WiFi is provided by Kent State. *All attendees should use this network, even if you attend Kent State University.*\n\n**SSID:** KSUEvent\n\n**Password:** kenthackenough\n### Getting around\nWe know it can be confusing to find your way in an unfamiliar place! Specific locations of every event can be found on [our schedule](https://khe.io/schedule), but here's a brief overview of the important stuff:\n\nLibrary 1st Floor: Check-in, opening ceremony, workshops\n\nLibrary 2nd Floor: Food, drinks, sponsors, help desk\n\nLibrary 4th Floor: Hacking space\n\nThere are also signs all over the library pointing you to specific locations and events. Ask a volunteer if you can't find something!\n### Questions?\nIf you have any questions at all, please don't hesitate to ask a volunteer. There will also be a help desk manned by volunteers during the entire event on the 2nd floor, next to the food area. Volunteers will also be scattered throughout the library (the people in the awesome all-over printed t-shirts), so please feel free to ask them anything.\n### In case of emergency\nIf you encounter any kind of life-threatening emergency, please call 911 immediately and then find a volunteer or on-site security guard. For any emergencies that don't fall into this category, please report to on-site security or a volunteer.\n### Code of Conduct\nWe adhere to and enforce the [MLH Code of Conduct](http://go.khe.io/conduct). If you in any way feel like someone has violated this document, please report it immediately to a volunteer.\n\nEnjoy!\n\nKent Hack Enough Staff",
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
    let form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err || !files.resume) return res.singleError('Resume file required', 400);
      fs.readFile(files.resume[0].path, (err, data) => {
        if (err) return res.internalError();
        let ext = path.extname(files.resume[0].path);
        let name = uuid.v4();
        let dest = path.join(__dirname, '../../../uploads/' + name + ext);
        fs.writeFile(dest, data, (err) => {
          if (err) return res.internalError();
          return res.status(200).json({
            filename: name + ext
          });
        });
      });
    });
  },

  /**
  * Retreive a resume
  * GET /users/application/resume/:filename
  */
  getResume: (req, res) => {
    let file = path.join(__dirname, '../../../uploads', req.params.filename);
    res.download(file);
  }

};
