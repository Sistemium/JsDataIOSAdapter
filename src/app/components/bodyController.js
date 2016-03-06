'use strict';

(function () {

    angular.module('webPage').controller('BodyController', function ($scope) {

      var ua = new UAParser();
      var deviceInfo = ua.getOS();

      $scope.cls = deviceInfo.name ? deviceInfo.name.replace (' ','') : '';

    });

})();
