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

  function run(Sockets,InitService,Auth,IosAdapter,Schema,Picker,DEBUG, saApp) {

    InitService
      .then(Sockets.init)
      .then(saApp.init);

    Auth.init().success(function(res) {

      console.log ('Auth', res);
      InitService.init(angular.extend(
        InitService.localDevMode ? {} :
        {
          url: {
            socket: 'https://socket2.sistemium.com'
          }
        },{
          jsDataPrefix: res.account.org + '/',
          org: res.account.org
        }
      ));

      Sockets.on('jsData:update', function (data) {
        DEBUG('jsData:update', data);
      });

      var lastPicker = window.localStorage.getItem('currentPickerId');

      if (lastPicker) {
        Picker.setCurrentById(lastPicker).then(function (p) {
          Auth.login(p);
        });
      }

    });

  }

})();
