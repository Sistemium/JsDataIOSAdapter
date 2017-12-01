'use strict';

(function () {

  angular.module('webPage').controller('BodyController', function (appcache, toastr, $window) {

    const vm = this;
    const ua = new UAParser();
    const osInfo = ua.getOS();
    const deviceInfo = ua.getDevice();

    let classes = [];

    if (osInfo.name) {
      classes.push(osInfo.name.replace(' ', ''));
    }

    if (deviceInfo.type) {
      classes.push(deviceInfo.type);
    }

    vm.cls = classes.join(' ');

    vm.cacheStatus = function () {
      return appcache.textStatus;
    };

    function onUpdate() {
      toastr.error('Нажмите, чтобы применить его', 'Получено обновление', {
        timeOut: 0,
        extendedTimeOut: 0,
        onTap: function () {
          $window.location.reload(true);
        }
      });
    }

    $window.stmAppCacheUpdated = onUpdate;

    appcache.addEventListener('updateready', onUpdate, true);

  });

})();
