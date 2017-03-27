'use strict';

(function () {

  angular
    .module('webPage')
    .run(run)
    .service('DEBUG', debugService)
    .config(localStorageServiceProvider => {
      localStorageServiceProvider.setPrefix('stg');
    })
    .run(amMoment => {
      amMoment.changeLocale('ru');
    })
    .config($locationProvider => {
      $locationProvider.hashPrefix('');
    })
    .config($compileProvider => {
      $compileProvider.preAssignBindingsEnabled(true);
    })
  ;

  function debugService(saDebug) {
    return saDebug.log('stg:log');
  }

  function run($rootScope, Sockets, InitService, Auth, Picker, DEBUG, saApp, $state, phaService, IOS, PickerAuth, localStorageService) {

    let lastState = localStorageService.get('lastState');

    PickerAuth.init();

    InitService
      .then(Sockets.init)
      .then(saApp.init)
      .catch(error => localStorageService.set('error', angular.toJson(error)));

    Auth.init(IOS.isIos() ? IOS.init() : phaService).then(function (res) {

      console.log('Auth', res);

      let org = _.get(res, 'account.org');
      let isTestOrg = /^(dev|dr50)$/.test(org);

      let appConfig =
          // InitService.localDevMode ? {} :
          {
            url: {
              socket: isTestOrg ? 'https://socket2.sistemium.com' : 'https://socket.sistemium.com'
            }
          }
        ;

      if (!IOS.isIos()) {
        angular.extend(appConfig, {
          jsDataPrefix: org + '/',
          org
        });
      }

      InitService.init(appConfig);

      //sockAuth();
      InitService.then(() => Sockets.on('connect', sockAuth));

      function sockAuth() {
        let accessToken = Auth.getAccessToken();
        if (!accessToken) {
          return;
        }
        Sockets.emit('authorization', {accessToken: accessToken}, function (ack) {
          DEBUG('Socket authorization:', ack);
          $rootScope.$broadcast('socket:authorized');
        });
      }

      //Sockets.on('jsData:update', (data) => DEBUG('jsData:update', data));

      let lastPicker = window.localStorage.getItem('currentPickerId');

      if (lastPicker) {
        Picker.setCurrentById(lastPicker)
          .then(function (p) {
            PickerAuth.login(p, lastState);
          });
      } else if (lastState) {
        $state.go(lastState.name, lastState.params);
      }

      $rootScope.$on('$destroy', $rootScope.$on('$stateChangeSuccess',
        (e, to, params) => localStorageService.set('lastState', {
          name: to.name,
          params: params
        })
      ));

    });

  }

})();
