(function () {
  'use strict';

  angular
    .module('webPage')
    .run(run)
    .service('DEBUG', debugService)
    .config(function(localStorageServiceProvider){
      localStorageServiceProvider.setPrefix('stg');
    })
  ;

  function debugService(saDebug) {
    return saDebug.log('stg:log');
  }

  function run($rootScope, Sockets, InitService, Auth, Picker, DEBUG, saApp, $state, phaService, IOS, PickerAuth, localStorageService) {

    PickerAuth.init();

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
          PickerAuth.login(p);
        });
      }

      $rootScope.$on('$destroy', $rootScope.$on('$stateChangeSuccess', function (e, to, params) {

        localStorageService.set('lastState', {
          name: to.name,
          params: params
        });

      }));

      var lastState = localStorageService.get('lastState');

      if (lastState) {
        $state.go(lastState.name,lastState.params);
      }
      
    });

  }

})();
