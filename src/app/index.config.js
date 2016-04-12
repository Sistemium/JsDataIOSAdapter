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

  function run(Sockets,InitService,Auth,Schema) {

    var DEBUG = debug ('stg:run');

    InitService.init(InitService.localDevMode ? {} : {
      url:{
        socket: 'https://socket2.sistemium.com'
      }
    });

    Sockets.on('jsData:update',function(data){
      DEBUG ('jsData:update', data);
    });

    var lastPicker = window.localStorage.getItem('currentPickerId');
    
    if (lastPicker) {
      Schema.model('Picker').setCurrentById(lastPicker).then(function(p){
        Auth.login(p);
      });
    }

  }

})();
