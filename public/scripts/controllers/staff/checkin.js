angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router.when('/staff/attendees/checkin', {
      templateUrl: '/views/staff/checkin.html'
    });
  }])
  .controller('StaffCheckInCtrl', ['User', 'Application', function (User, Application) {

    var self = this;
    var user = new User();
    var application = new Application();

    self.me = user.getMe();

    self.users = [];
    self.count = 0;

    function updateCount() {
      self.count = self.users.filter(function (user) {
        return user.application.checked;
      }).length;
    }

    // Populate our user list
    function get() {
      user.list().
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.users = data.users;
          updateCount();
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    }
    get();

    // Hold the quick application object
    // (name, email, phone)
    self.quickApp = {};

    // Submit the quick registration form
    self.register = function () {
      application.quick(self.quickApp).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.users.push(data);
          self.quickApp = {};
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    };

    // Toggle the checked in status of the user
    self.toggleChecked = function (user) {
      console.log(user.application.checked);
      application.updateById(user._id, {
        checked: user.application.checked
      }).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          updateCount();
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    };

  }]);