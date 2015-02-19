angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router
      .when('/application', {
        templateUrl: '/views/application.html'
      });
  }])
  .controller('ApplicationCtrl', ['$location', 'User', function ($location, User) {

    var self = this;
    var user = new User();

    // Get the logged in user if it exists
    self.me = user.getMe();



  }]);