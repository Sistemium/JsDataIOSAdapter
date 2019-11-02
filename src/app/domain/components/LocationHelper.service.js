'use strict';

(function () {

  function LocationHelper(IOS, $window, $q, Schema, $timeout) {

    function browserGetLocation(accuracy, timeout) {

      let geo = $window.navigator.geolocation;
      let watchID;
      let timeoutId;

      timeout = timeout || 30000;

      return $q(function (resolve, reject) {

        let geoOptions = {
          enableHighAccuracy: true,
          maximumAge: timeout,
          timeout: timeout
        };

        function successWatch(location) {
          if (_.get(location, 'coords.accuracy') <= accuracy) {
            $timeout.cancel(timeoutId);
            geo.clearWatch(watchID);
            let coords = location.coords;
            let res = {
              horizontalAccuracy: coords.accuracy,
              latitude: coords.latitude,
              longitude: coords.longitude,
              timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            };

            resolve(res);
          }
        }

        function failWatch(err) {
          $timeout.cancel(timeoutId);
          geo.clearWatch(watchID);
          reject(err);
        }

        try {

          watchID = geo.watchPosition(successWatch, failWatch, geoOptions);

          timeoutId = $timeout(() => {
            geo.clearWatch(watchID);
            reject('Время ожидания геометки истекло');
          }, timeout);

        } catch (e) {
          reject(e);
        }

      });

    }

    function getLocation(accuracy, ownerXid, target, timeout) {

      let initData = {
        ownerXid: ownerXid,
        target: target
      };

      if (IOS.isIos()) {
        return IOS.checkIn(accuracy, initData, timeout);
      } else {
        return browserGetLocation(accuracy, timeout)
          .then(function (location) {
            let Location = Schema.model('Location');
            return Location.create(_.assign(location, initData));
          });
      }


    }

    return {
      getLocation,
    };

  }

  angular.module('core.services')
    .service('LocationHelper', LocationHelper);

})();
