'use strict';

(function () {

  angular.module('webPage').controller('BodyController', function (appcache, toastr, $window, userAgentInfo, IOS) {

    const vm = this;

    const {osInfo, deviceInfo} = userAgentInfo;

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
      toastr.error('Нажмите, чтобы применить его', 'Получено обновление программы', {
        timeOut: 0,
        extendedTimeOut: 0,
        onTap: function () {
          $window.location.reload(true);
        }
      });
    }

    // TODO: Android is using appcache
    // if (!IOS.isIos()) {
      appcache.addEventListener('updateready', onUpdate, true);
    // }

  });

})();
