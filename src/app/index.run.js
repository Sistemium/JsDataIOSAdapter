(function() {
  'use strict';

  angular
    .module('webPage')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
