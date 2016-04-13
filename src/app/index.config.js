(function() {
  'use strict';

  angular
    .module('webPage')
    .run(run)
  ;

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
