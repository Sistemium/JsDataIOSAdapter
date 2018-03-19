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
    .config($animateProvider => {
      $animateProvider.classNameFilter(/animate/);
    })
  ;

  function debugService(saDebug) {
    return saDebug.log('stg:log');
  }

  function run($rootScope, Sockets, InitService, Auth, Picker, DEBUG, saApp, $state, phaService,
               IOS, PickerAuth, localStorageService, $injector,
               appcache) {

    let lastState = localStorageService.get('lastState');

    PickerAuth.init();

    InitService
      .then(Sockets.init)
      .then(saApp.init)
      .catch(error => localStorageService.set('error', angular.toJson(error)));

    Auth.init(IOS.isIos() ? IOS.init() : phaService)
      .then(onAuth);

    /*
    Functions
     */

    function onAuth(authorization) {

      console.log('Auth', authorization);

      let org = _.get(authorization, 'account.org');
      let isTestOrg = /^(dev|dr50p?)$/.test(org);

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

      let lastPicker = window.localStorage.getItem('currentPickerId');

      if (lastPicker) {
        Picker.setCurrentById(lastPicker)
          .then(function (p) {
            PickerAuth.login(p, lastState);
          });
      } /*else if (lastState) {
        $state.go(lastState.name, lastState.params);
      }*/

      $rootScope.$on('$destroy', $rootScope.$on('$stateChangeSuccess',
        (e, to, params) => localStorageService.set('lastState', {
          name: to.name,
          params: params
        })
      ));



      function sockAuth() {

        let accessToken = Auth.getAccessToken();

        if (!IOS.isIos()) {

          appcache.checkUpdate()
            .catch(() => 'no update');

          if (!accessToken) {
            return $state.go('auth');
          }

        }

        Sockets.emit('authorization', {accessToken: accessToken}, ack => {

          DEBUG('Socket authorization:', ack);
          $rootScope.$broadcast('socket:authorized');

          //Sockets.on('jsData:update', (data) => DEBUG('jsData:update', data));

          if (Auth.isAuthorized(['salesman', 'supervisor'])) {
            console.info($injector.get('SalesmanAuth'));
          }

          if (lastState) {
            console.warn('Restoring last state', lastState.name, lastState.params);
            $state.go(lastState.name, lastState.params);
            lastState = false;
          }

        });

      }


    }

  }

})();
