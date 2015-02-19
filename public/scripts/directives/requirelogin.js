angular
  .module('khe')
  .directive('requirelogin', function () {
    return {

      restrict: 'E',
      transclude: true,

      templateUrl: '/views/directives/requirelogin.html',

      scope: {
        user: '=user',
        error: '=error'
      }

    };
  });