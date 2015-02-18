angular
  .module('khe')
  .config(['$routeProvider', function ($router) {
    $router
      .when('/', {
        templateUrl: '/views/home.html'
      });
  }])
  .controller('UserCtrl', ['$location', 'User', function ($scope, $location, User) {

  }]);