(function () {

  var app = angular.module('khe', ['ngRoute', 'khe.controllers']);

  /**
  * Configure routes
  */
  app.config(['$routeProvider', function ($router) {
    $router
      .when('/', {
        templateUrl: '/templates/home.html'
      })
      .when('/staff', {
        templateUrl: '/templates/staff/index.html'
      });
  }]);

})();