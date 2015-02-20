angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router.when('/staff/attendees', {
      templateUrl: '/views/staff/attendees.html'
    });
  }])
  .controller('StaffAttendeesCtrl', ['User', function (User) {

    var self = this;
    var user = new User();
    self.user = user.getMe();

    self.users = [];
    self.current = [];

    // Get all users
    user.list().
    success(function (data) {
      self.errors = data.errors;
      if (!self.errors) {
        self.users = data.users;
        readable();
        self.current = self.users;
      }
    }).
    error(function () {
      self.errors = ['An internal error occurred'];
    });

    // Display all users
    self.all = function () {
      self.current = self.users;
    };

    // Display users with submitted applications
    self.applied = function () {
      self.current = self.users.filter(function (user) {
        return user.application.submitted;
      });
    };

    // Display users that have RSVPd yes
    self.going = function () {
      self.current = self.users.filter(function (user) {
        return user.application.going;
      });
    };

    // Display approved users
    self.approved = function () {
      self.current = self.users.filter(function (user) {
        return user.application.status == 'approved';
      });
    };

    // Display waitlisted users
    self.waitlisted = function () {
      self.current = self.users.filter(function (user) {
        return user.application.status == 'waitlisted';
      });
    };

    // Display pending users
    self.pending = function () {
      self.current = self.users.filter(function (user) {
        return user.application.status == 'pending';
      });
    };

    // Display denied users
    self.denied = function () {
      self.current = self.users.filter(function (user) {
        return user.application.status == 'denied';
      });
    };

    // Expand a user
    self.toggle = function (user) {
      if (self.expandedId == user._id) {
        self.expandedId = '';
      } else {
        self.expandedId = user._id;
      }
    };

    // Check if a user is expanded
    self.expanded = function (user) {
      return self.expandedId == user._id;
    };

    function readable() {
      for (var i = 0; i < self.users.length; i++) {
        var user = self.users[i];
        if (user.application.submitted) {
          user.application.phone = Helpers.formatPhoneNumber(user.application.phone);
          switch (user.application.shirt) {
            case 'S':
              user.application.shirt = 'Small';
              break;
            case 'M':
              user.application.shirt = 'Medium';
              break;
            case 'L':
              user.application.shirt = 'Large';
              break;
            case 'XL':
              user.application.shirt = 'X-Large';
              break;
          }
          user.application.gender = user.application.gender[0].toUpperCase() + user.application.gender.slice(1);
          user.application.first = (user.application.first ? 'Yes' : 'No');
          if (user.application.dietary) {
            var diet = user.application.dietary[0];
            for (var j = 1; j < user.application.dietary.length; j++) {
              diet = diet + ', ' + user.application.dietary[j];
            }
            user.application.dietary = diet;
          }
          user.application.travel = (user.application.travel ? 'Yes' : 'No');
          user.application.status = user.application.status[0].toUpperCase() + user.application.status.slice(1);
          user.application.checked = (user.application.checked ? 'Yes': 'No');
          user.application.going = (user.application.going ? 'Yes': 'No');
          user.role = user.role[0].toUpperCase() + user.role.slice(1);
        }
      };
    }

  }]);