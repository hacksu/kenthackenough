angular
  .module('khe')
  .filter('unsafe', ['$sce', function ($sce) {
    return function (input) {
      return $sce.trustAsHtml(input);
    };
  }]);