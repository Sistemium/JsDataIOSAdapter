(function() {
  'use strict';

  angular
    .module('webPage')
    .config(config)
    .run(run)
  ;

  /** @ngInject */
  function config(toastrConfig) {

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

  function run(Sockets,InitService) {
    var DEBUG = debug ('stg:run')
    InitService.init();
    Sockets.on('jsData:update',function(data){
      DEBUG ('jsData:update', data);
    });
  }

})();
