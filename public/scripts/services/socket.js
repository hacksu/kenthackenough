angular
  .module('khe')
  .factory('Socket', ['socketFactory', function (socketFactory) {
    return socketFactory();
  }]);