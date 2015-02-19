angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router
      .when('/application', {
        templateUrl: '/views/application.html'
      });
  }])
  .controller('ApplicationCtrl', ['$location', 'User', 'Application', function ($location, User, Application) {

    var self = this;
    var user = new User();
    var application = new Application();

    // Get the logged in user if it exists
    self.me = user.getMe();

    // Populate the form if it exists
    application.get().
    success(function (data) {
      if (!data.errors) {
        angular.extend(self, data);
        // translate a few things to populate the form
        self.name = self.name.split(' ');
        self.name.first = self.name[0];
        self.name.last = self.name[1];
        self.first = String(self.first);
        self.travel = String(self.travel);
        var newDietary = {};
        for (var i = 0; i < self.dietary.length; ++i) {
          newDietary[self.dietary[i]] = true;
        }
        self.dietary = newDietary;
        console.log(self);
      }
    }).
    error(function () {
      self.errors = ['An internal error occurred'];
    });

    /**
    * Submit or update the user's application
    */
    self.submit = function () {
      // make a string of dietary restrictions
      var restrictions = null;
      if (self.dietary) {
        var restrictions = '';
        for (diet in self.dietary) {
          restrictions += diet + '|'
        }
        var restrictions = restrictions.substr(0, restrictions.length - 1);
      }

      // build the application object
      var app = {
        name: self.name.first + ' ' + self.name.last,
        school: self.school,
        phone: self.phone,
        shirt: self.shirt,
        demographic: self.demographic,
        first: self.first,
        year: self.year,
        age: self.age,
        gender: self.gender,
        major: self.major,
        conduct: self.conduct,
        travel: self.travel,
        waiver: self.waiver
      };
      if (restrictions) {
        angular.extend(app, {dietary: restrictions});
      }

      // submit the application
      if (self.submitted) {
        application.update(app).
        success(function (data) {
          self.errors = data.errors;
          if (!data.errors) {
            $location.path('/');
          }
        }).
        error(function () {
          self.errors = ['An internal error occurred'];
        });
      } else {
        application.submit(app).
        success(function (data) {
          self.errors = data.errors;
          if (!data.errors) {
            $location.path('/');
          }
        }).
        error(function (data) {
          self.errors = ['An internal error occurred'];
        });
      }
    };

  }]);