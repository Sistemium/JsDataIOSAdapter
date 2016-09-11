'use strict';

(function () {

  function saEtc($window, $timeout) {

    function blurActive() {
      return _.result($window.document, 'activeElement.blur');
    }

    function focusElementById(id) {
      $timeout(function() {

        var element = $window.document.getElementById(id);
        if (element) element.focus();

      });
    }

    return {
      blurActive,
      focusElementById
    };

  }

  angular.module('sistemium.services')
    .service('saEtc', saEtc);

})();
