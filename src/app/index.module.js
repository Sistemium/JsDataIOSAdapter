(function () {
  'use strict';

  angular
    .module('webPage', [
      'ngAnimate',
      'ngTouch',
      'ngSanitize',
      'ngMessages',
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
      'Warehousing',
      'cgBusy',
      'vs-repeat',
      'jsd',
      'toggle-switch',
      'angularMoment',
      'swipe',
      'ngFileUpload',
      'ngPinchZoom',
      'io-barcode',
    ]);

  angular.module('Sales', ['sistemium', 'yaMap', 'rzModule']);

  angular.module('jsd', ['sistemiumBootstrap', 'Models']);


})();
