'use strict';

(function() {

  angular
    .module('webPage')
    .run(runBlock);

  /** @ngInject */
  function runBlock() {
    // uncomment to check how often browser reloads
    // localStorage.setItem('cnt', parseInt(localStorage.getItem('cnt') || 0) + 1);
  }

})();
