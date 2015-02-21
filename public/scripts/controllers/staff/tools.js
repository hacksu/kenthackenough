angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router.when('/staff/tools', {
      templateUrl: '/views/staff/tools.html'
    });
  }])
  .controller('StaffToolsCtrl', ['User', 'Url', function (User, Url) {

    var self = this;
    self.user = new User().getMe();
    var url = new Url();

    self.urls = [];

    // Get a list of the current URLs
    function get() {
      url.list().
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.urls = data.urls;
        }
      }).
      error();
    }
    get();

    // Store the model for a new URL
    self.new = {};

    // Save a new URL
    this.save = function () {
      url.shorten(self.new.full, self.new.short).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.new = {};
          get();
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    };

    // Remove a url
    this.remove = function (u) {
      url.remove(u._id).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          get();
        }
      }).
      error(function () {
        self.errors = ['An internal error occurred'];
      });
    };

  }]);