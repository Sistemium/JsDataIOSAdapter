'use strict';

(function () {

  function saEtc($window) {

    function blurActive() {
      return _.result($window.document, 'activeElement.blur');
    }

    return {
      blurActive
    };

  }

  angular.module('sistemium.services')
    .service('saEtc', saEtc);

})();
