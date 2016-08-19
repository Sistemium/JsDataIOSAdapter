'use strict';

(function () {

  function LocationHelper(IOS, $window, $q, Schema) {

    function browserGetLocation(accuracy) {

      var geo = $window.navigator.geolocation;

      return $q(function (resolve, reject) {

        var geoOptions = {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        };

        function successWatch(location) {
          if (_.get(location, 'coords.accuracy') <= accuracy) {
            geo.clearWatch(watchID);
            /*
             {
             accuracy: 65,
             altitude: null,
             altitudeAccuracy: null,
             heading: null,
             latitude: 54.69379157800531,
             longitude: 25.268661268375816,
             speed: null
             },
             timestamp: 493297545792
             */
            var coords = location.coords;
            var res = {
              horizontalAccuracy: coords.accuracy,
              latitude: coords.latitude,
              longitude: coords.longitude,
              timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS')
            };

            resolve(res);
          }
        }

        function failWatch(err) {
          geo.clearWatch(watchID);
          reject(err);
        }

        var watchID = geo.watchPosition(successWatch, failWatch, geoOptions);

      });

    }

    function getLocation(accuracy, ownerXid, target) {

      var initData = {
        ownerXid: ownerXid,
        target: target
      };

      if (IOS.isIos()) {
        return IOS.checkIn(accuracy, initData);
      } else {
        return browserGetLocation(accuracy)
          .then(function (location) {
            var Location = Schema.model('Location');
            return Location.create(_.assign(location, initData));
          })
      }


    }

    return {
      getLocation: getLocation
    };

  }

  angular.module('core.services')
    .service('LocationHelper', LocationHelper);

})();
