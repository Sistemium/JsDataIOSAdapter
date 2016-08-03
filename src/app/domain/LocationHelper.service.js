'use strict';

(function () {

  function LocationHelper(IOS) {

    function getLocation(accuracy, ownerXid, target) {

      return IOS.checkIn(accuracy, {
        ownerXid: ownerXid,
        target: target
      });

    }

    return {
      getLocation: getLocation
    };

  }

  angular.module('core.services')
    .service('LocationHelper', LocationHelper);

})();
