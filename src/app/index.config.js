(function () {
  'use strict';

  angular
    .module('webPage')
    .run(run)
    .service('DEBUG', debugService)
  ;

  function debugService(saDebug) {
    return saDebug.log('stg:log');
  }

  function run(Sockets, InitService, Auth, Picker, DEBUG, saApp, phaService, IOS) {

    InitService
      .then(Sockets.init)
      .then(saApp.init);

    Auth.init(IOS.isIos() ? IOS.init() : phaService).then(function (res) {

      console.log('Auth', res);

      var appConfig =
          InitService.localDevMode ? {} :
          {
            url: {
              socket: 'https://socket2.sistemium.com'
            }
          }
        ;

      if (!IOS.isIos()) {
        angular.extend(appConfig, {
          // jsDataPrefix: res.account.org + '/'
          org: res.account.org
        });
      }

      InitService.init(appConfig);

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
