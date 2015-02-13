(function () {

  var app = angular.module('khe.controllers', []);

  app.controller('UserController', ['$http', '$scope', function ($http, $scope) {
    $scope.message = 'Hello there';
  }]);

  app.directive('staffheader', function () {
    return {
      templateUrl: '/partials/staff-header.html'
    };
  });

})();