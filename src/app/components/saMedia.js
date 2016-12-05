'use strict';

(function () {

  function saMedia($window, $rootScope) {

    const SCREEN_XS_MAX = 768;

    const service = {};

    $rootScope.$watch(getWindowDimensions, setValues, true);

    return service;

    /*
     Functions
     */

    function setValues(newValue) {
      _.assign(service, newValue);
      _.assign(service, {
        xsWidth: _.get(newValue, 'windowWidth') < SCREEN_XS_MAX
      });
    }

    function getWindowDimensions() {
      return {
        windowHeight: $window.innerHeight,
        windowWidth: $window.innerWidth
      };
    }

  }

  angular.module('sistemium.services').service('saMedia', saMedia);

})();
