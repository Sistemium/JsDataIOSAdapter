(function() {
  'use strict';

  angular
    .module('webPage')
    .config(config);

  /** @ngInject */
  function config($logProvider, toastrConfig) {
    // Enable log
    $logProvider.debugEnabled(true);

    // Set options third-party lib

    angular.extend (toastrConfig,{
      allowHtml: true,
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: false,
      progressBar: false,
      iconClasses: {
        error: 'alert alert-danger',
        info: 'alert alert-info',
        success: 'alert alert-success',
        warning: 'alert alert-warning'
      }
    });
  }

})();
