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

    function getElementById(id) {
      return $window.document.getElementById(id);
    }

    function scrolTopElementById(id) {
      let element = getElementById(id);
      if (!element) return;
      element.scrollTop = 0;
    }

    return {
      scrolTopElementById,
      getElementById,
      blurActive,
      focusElementById
    };

  }

  angular.module('sistemium.services')
    .service('saEtc', saEtc);

})();
