angular.module('khe', ['ngRoute', 'ngCookies']);

angular.module('khe').config(['$locationProvider', function ($locationProvider) {
  $locationProvider.html5Mode(true);
}]);