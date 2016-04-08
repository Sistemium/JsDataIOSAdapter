(function() {
  'use strict';

  angular
    .module('webPage', [
      'ngAnimate',
      'ngTouch',
      'ngSanitize',
      'ngMessages',
      'ngAria',
      'ui.router',
      'ui.router.stateHelper',
      'ui.bootstrap',
      'toastr',
      'LocalStorageModule',
      'as.sortable',
      'core.services',
      'Models',
      'ng-appcache',
      'ui.mask'
    ])
    .run(function(Auth){
      console.log (Auth);
    });

})();
