'use strict';

(function () {

    angular.module('webPage').controller('BodyController', function () {

      var vm = this;
      var ua = new UAParser();
      var deviceInfo = ua.getOS();

      vm.cls = deviceInfo.name ? deviceInfo.name.replace (' ','') : '';

    });

})();
