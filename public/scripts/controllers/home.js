angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router
      .when('/', {
        templateUrl: '/views/home.html'
      });
  }])
  .controller('HomeCtrl', ['$location', 'User', function ($location, User) {

    var self = this;
    var user = new User();

    // Get the logged in user if it exists
    self.me = user.getMe();

    /**
    * Register a new user and log them in
    */
    self.register = function () {
      user.register({
        email: self.email,
        password: self.password
      }).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.me = data;
          user.setMe(self.me);
          $location.path('/application');
        }
      }).
      error(function (data, status) {
        self.errors = ['An internal error has occurred'];
      });
    };

    /**
    * Login the user
    */
    self.login = function () {
      user.login({
        email: self.email,
        password: self.password
      }).
      success(function (data) {
        self.errors = data.errors;
        if (!data.errors) {
          self.me = data;
          user.setMe(self.me);
        }
      }).
      error(function (data, status) {
        console.log(data);
        self.errors = ['An internal error has occurred'];
      });
    };

    /**
    * Log the user out
    */
    self.logout = function () {
      self.me = null;
      user.removeMe();
    };

  }]);