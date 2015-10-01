'use strict';

let Application = rootRequire('app/users/application/model');
let User = rootRequire('app/users/model');
let log = rootRequire('app/helpers/logger');

module.exports = {

  /**
  * Build a line graph of registrations over time
  * GET /stats/registrations
  * Auth -> admin, staff
  */
  registrations: (req, res) => {
    User
      .find()
      .select('application')
      .populate({
        path: 'application',
        match: req.query,
        select: 'created'
      })
      .exec((err, users) => {
        if (err) return res.internalError();
        let apps = users.filter((user) => {
          return user.application;
        }).map((user) => {
          return user.application;
        });
        let months = [
          {name: 'January', count: 0},
          {name: 'February', count: 0},
          {name: 'March', count: 0},
          {name: 'April', count: 0},
          {name: 'May', count: 0},
          {name: 'June', count: 0},
          {name: 'July', count: 0},
          {name: 'August', count: 0},
          {name: 'September', count: 0},
          {name: 'October', count: 0},
          {name: 'November', count: 0},
          {name: 'December', count: 0}
        ];
        for (let i = 0; i < apps.length; ++i) {
          let index = apps[i].created.getMonth(); // int value of the month, ex 7
          months[index].count++;
        }
        return res.status(200).json({
          months: months.filter((month) => {
            return month.count;
          })
        });
      });
  },

  /**
  * Get the distribution of t-shirt sizes for all applications
  * GET /stats/shirts
  * Auth -> admin, staff
  */
  shirts: (req, res) => {
    User
      .find()
      .select('application')
      .populate({
        path: 'application',
        match: req.query,
        select: 'shirt'
      })
      .exec((err, users) => {
        if (err) return res.internalError();
        let apps = users.filter((user) => {
          return user.application;
        }).map((user) => {
          return user.application;
        });
        let small = 0;
        let medium = 0;
        let large = 0;
        let xlarge = 0;
        for (let i = 0; i < apps.length; ++i) {
          switch (apps[i].shirt) {
            case 'S':
              small++;
              break;
            case 'M':
              medium++;
              break;
            case 'L':
              large++;
              break;
            case 'XL':
              xlarge++;
              break;
          }
        }
        return res.status(200).json({
          small: small,
          medium: medium,
          large: large,
          xlarge: xlarge
        });
      });
  },

  /**
  * Get a breakdown of dietary restrictions
  * GET /stats/dietary
  * Auth -> admin, staff
  */
  dietary: (req, res) => {
    User
      .find()
      .select('application')
      .populate({
        path: 'application',
        match: req.query,
        select: 'dietary'
      })
      .exec(function (err, users) {
        if (err) return res.internalError();
        let apps = users.filter((user) => {
          return user.application;
        }).map((user) => {
          return user.application;
        });
        let restrictions = {};
        for (let i = 0; i < apps.length; ++i) {
          if (apps[i].dietary) {
            for (let j = 0; j < apps[i].dietary.length; ++j) {
              let name = apps[i].dietary[j];
              if (name in restrictions) {
                restrictions[name]++;
              } else {
                restrictions[name] = 1;
              }
            }
          }
        }
        let dietary = [];
        for (let key in restrictions) {
          if (restrictions.hasOwnProperty(key)) {
            dietary.push({
              name: key,
              count: restrictions[key]
            });
          }
        }
        return res.status(200).json({restrictions: dietary});
      });
  },

  /**
  * Gender comparison
  * GET /stats/gender
  * Auth -> admin, staff
  */
  gender: (req, res) => {
    User
      .find()
      .select('application')
      .populate({
        path: 'application',
        match: req.query,
        select: 'gender'
      })
      .exec((err, users) => {
        if (err) return res.internalError();
        let apps = users.filter((user) => {
          return user.application;
        }).map((user) => {
          return user.application;
        });
        let male = 0;
        let female = 0;
        let other = 0;
        for (let i = 0; i < apps.length; ++i) {
          if (apps[i].gender) {
            if (apps[i].gender.toLowerCase() == 'male') {
              male++;
            } else if (apps[i].gender.toLowerCase() == 'female') {
              female++;
            } else {
              other++;
            }
          }
        }
        return res.status(200).json({
          male: male,
          female: female,
          other: other
        });
      });
  },

  /**
  * Get a distribution of schools
  * GET /stats/schools
  * Auth -> admin, staff
  */
  schools: (req, res) => {
    User
      .find()
      .select('application')
      .populate({
        path: 'application',
        match: req.query,
        select: 'school'
      })
      .exec((err, users) => {
        if (err) return res.internalError();
        let apps = users.filter((user) => {
          return user.application;
        }).map((user) => {
          return user.application;
        });
        let s = {};
        for (let i = 0; i < apps.length; ++i) {
          if (apps[i].school) {
            let school = apps[i].school;
            s[school] = (s[school] || 0) + 1;
          }
        }
        let schools = [];
        for (let key in s) {
          schools.push({
            name: key,
            count: s[key]
          });
        }
        schools = schools.slice(0, 10);
        return res.status(200).json({schools: schools});
      });
  },

  /**
  * Query for numbers of applications
  * GET /stats/count?param=value
  * Auth -> admin, staff
  */
  count: (req, res) => {
    Application
      .count(req.query)
      .exec((err, count) => {
        if (err) return res.internalError();
        return res.status(200).json({count});
      });
  }

};
