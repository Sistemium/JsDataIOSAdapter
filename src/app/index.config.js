(function() {
  'use strict';

  angular
    .module('webPage')
    .run(run)
    .service('DEBUG',debugService)
  ;

  function debugService (saDebug) {
    return saDebug.log('stg:log');
  }

  function run(Sockets,InitService,Auth,IosAdapter,Schema,Picker,DEBUG) {

    InitService.init(InitService.localDevMode ? {} : {
      url:{
        socket: 'https://socket2.sistemium.com'
      }
    });

    Sockets.init(InitService);

    Sockets.on('jsData:update',function(data){
      DEBUG ('jsData:update', data);
    });

    var lastPicker = window.localStorage.getItem('currentPickerId');

    if (lastPicker) {
      Picker.setCurrentById(lastPicker).then(function(p){
        Auth.login(p);
      });
    }

  }

})();
