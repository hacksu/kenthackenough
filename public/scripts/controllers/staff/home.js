angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router
      .when('/staff', {
        templateUrl: '/views/staff/home.html'
      });
  }])
  .controller('StaffHomeCtrl', ['User', function (User) {

    var self = this;
    var user = new User();
    self.user = user.getMe();

  }]);