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
      $compileProvider.debugInfoEnabled(false);
      $compileProvider.commentDirectivesEnabled(false);
      $compileProvider.cssClassDirectivesEnabled(false);
    })
    .config($animateProvider => {
      $animateProvider.classNameFilter(/animate/);
    })
  ;

  function debugService(saDebug) {
    return saDebug.log('stg:log');
  }

  /** @ngInject */
  function run($rootScope, Sockets, InitService, Auth, Picker, DEBUG, saApp, $state, phaService,
               IOS, PickerAuth, localStorageService, $injector,
               appcache, Schema) {

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

      // console.log('Auth', authorization);

      let org = _.get(authorization, 'account.org');
      let isTestOrg = /^(dev|dr50p?|ae)$/.test(org);

      let appConfig =
        // InitService.localDevMode ? {} :
        {
          url: {
            socket: isTestOrg ? 'https://socket2.sistemium.com' : 'https://socket-v2.sistemium.com'
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
      }

      function sockAuth() {

        let accessToken = Auth.getAccessToken();

        if (!IOS.isIos()) {

          appcache.checkUpdate()
            .catch(() => 'no update');

          if (!accessToken) {
            console.log('sockAuth no auth');
            return;
          }

        }

        $rootScope.$on('$destroy', $rootScope.$on('$stateChangeSuccess',
          (e, to, params) => localStorageService.set('lastState', {
            name: to.name,
            params: params
          })
        ));

        Sockets.emit('authorization', { accessToken: accessToken }, ack => {

          DEBUG('Socket authorization:', ack);

          //Sockets.on('jsData:update', (data) => DEBUG('jsData:update', data));

          if (Auth.isAuthorized(['salesman', 'supervisor', 'outlet', 'sales'])) {
            let sAuth = $injector.get('SalesmanAuth');
            DEBUG('Injecting SalesmanAuth:', sAuth);
          }

          $rootScope.$broadcast('socket:authorized');

          // if (lastState) {
          //   console.warn('Restoring last state', lastState.name, lastState.params);
          //   $state.go(lastState.name, lastState.params);
          //   lastState = false;
          // }

          if (IOS.isIos()) {
            Sockets.jsDataSubscribe(['RecordStatus']);
          }

          Sockets.onJsData('jsData:destroy', onJSDataDestroy);
          Sockets.onJsData('jsData:update', onJSData);

        });

        function onJSDataDestroy(event) {

          DEBUG('onJSDataDestroy', event);

          let id = _.get(event, 'data.id');

          if (!id) return;

          let model = Schema.model(event.resource);

          if (!model) return;

          model.eject(id);

        }

        function onJSData(event) {

          if (event.resource !== 'RecordStatus') return;

          try {
            let { name, objectXid } = event.data;
            Schema.model(name)
              .eject(objectXid);
          } catch (e) {
            console.warn('onJSData error:', e);
          }

        }

      }


    }

  }

})();
