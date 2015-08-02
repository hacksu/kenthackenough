var router = getRouter();
var User = rootRequire('app/users/model');
var Application = rootRequire('app/users/application/model');

/**
* Build a line graph of registrations over time
* GET /stats/registrations
* Auth -> admin, staff
*/
router.get('/stats/registrations', User.auth('admin', 'staff'), function (req, res) {
  User
    .find()
    .select('application')
    .populate({
      path: 'application',
      match: req.query,
      select: 'created'
    })
    .exec(function (err, users) {
      if (err) return res.internalError();
      var apps = users.filter(function (user) {
        return user.application;
      }).map(function (user) {
        return user.application;
      });
      var months = [
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
      for (var i = 0; i < apps.length; ++i) {
        var index = apps[i].created.getMonth(); // int value of the month, ex 7
        months[index].count++;
      }
      return res.json({
        months: months.filter(function (month) {
          return month.count;
        })
      });
    });
});

/**
* Get the distribution of t-shirt sizes for all applications
* GET /stats/shirts
* Auth -> admin, staff
*/
router.get('/stats/shirts', User.auth('admin', 'staff'), function (req, res) {
  User
    .find()
    .select('application')
    .populate({
      path: 'application',
      match: req.query,
      select: 'shirt'
    })
    .exec(function (err, users) {
      if (err) return res.internalError();
      var apps = users.filter(function (user) {
        return user.application;
      }).map(function (user) {
        return user.application;
      });
      var small = 0;
      var medium = 0;
      var large = 0;
      var xlarge = 0;
      for (var i = 0; i < apps.length; ++i) {
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
      return res.json({
        small: small,
        medium: medium,
        large: large,
        xlarge: xlarge
      });
    });
});

/**
* Get a breakdown of dietary restrictions
* GET /stats/dietary
* Auth -> admin, staff
*/
router.get('/stats/dietary', User.auth('admin', 'staff'), function (req, res) {
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
      var apps = users.filter(function (user) {
        return user.application;
      }).map(function (user) {
        return user.application;
      });
      var restrictions = {};
      for (var i = 0; i < apps.length; ++i) {
        if (apps[i].dietary) {
          for (var j = 0; j < apps[i].dietary.length; ++j) {
            var name = apps[i].dietary[j];
            if (name in restrictions) {
              restrictions[name]++;
            } else {
              restrictions[name] = 1;
            }
          }
        }
      }
      var dietary = [];
      for (var key in restrictions) {
        if (restrictions.hasOwnProperty(key)) {
          dietary.push({
            name: key,
            count: restrictions[key]
          });
        }
      }
      return res.json({restrictions: dietary});
    });
});

/**
* Gender comparison
* GET /stats/gender
* Auth -> admin, staff
*/
router.get('/stats/gender', User.auth('admin', 'staff'), function (req, res) {
  User
    .find()
    .select('application')
    .populate({
      path: 'application',
      match: req.query,
      select: 'gender'
    })
    .exec(function (err, users) {
      if (err) return res.internalError();
      var apps = users.filter(function (user) {
        return user.application;
      }).map(function (user) {
        return user.application;
      });
      var male = 0;
      var female = 0;
      var other = 0;
      for (var i = 0; i < apps.length; ++i) {
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
      return res.json({
        male: male,
        female: female,
        other: other
      });
    });
});

/**
* Get a distribution of schools
* GET /stats/schools
* Auth -> admin, staff
*/
router.get('/stats/schools', User.auth('admin', 'staff'), function (req, res) {
  User
    .find()
    .select('application')
    .populate({
      path: 'application',
      match: req.query,
      select: 'school'
    })
    .exec(function (err, users) {
      if (err) return res.internalError();
      var apps = users.filter(function (user) {
        return user.application;
      }).map(function (user) {
        return user.application;
      });
      var s = {};
      for (var i = 0; i < apps.length; ++i) {
        if (apps[i].school) {
          var school = apps[i].school;
          s[school] = (s[school] || 0) + 1;
        }
      }
      var schools = [];
      for (var key in s) {
        schools.push({
          name: key,
          count: s[key]
        });
      }
      schools = schools.slice(0, 10);
      return res.json({schools: schools});
    });
});