angular
  .module('khe')
  .directive('requirestaff', function () {
    return {

      restrict: 'E',
      transclude: true,

      templateUrl: '/views/directives/requirestaff.html',

      scope: {
        user: '=user',
        error: '=error'
      }

    };
  });