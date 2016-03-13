'use strict';

(function () {

    angular.module('webPage').controller('BodyController', function (appcache, toastr, $window) {

      var vm = this;
      var ua = new UAParser();
      var deviceInfo = ua.getOS();

      vm.cls = deviceInfo.name ? deviceInfo.name.replace (' ','') : '';
      vm.cacheStatus = function () {
        return appcache.textStatus;
      };

      appcache.addEventListener('updateready', function () {
        toastr.error ('Нажмите, чтобы применить его', 'Получено обновление', {
          timeOut: 0,
          extendedTimeOut: 0,
          onTap: function () {
            $window.location.reload (true);
          }
        });
      },true);

    });

})();
