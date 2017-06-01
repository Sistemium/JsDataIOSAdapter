(function () {
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
      'LocalStorageModule',
      'as.sortable',
      'core.services',
      'ng-appcache',
      'ui.mask',
      'sistemiumBootstrap',
      'Models',
      'Sales',
      'cgBusy',
      'vs-repeat',
      'jsd',
      'toggle-switch',
      'angularMoment',
      'swipe',
      'ngFileUpload'
    ]);

  angular.module('Sales', ['sistemium', 'yaMap']);

  angular.module('jsd', ['sistemiumBootstrap', 'Models']);


})();
