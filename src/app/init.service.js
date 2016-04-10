'use strict';

(function () {

  function InitService($rootScope, $q) {

    var me = this;
    var isInitialized = false;
    var localDevMode = !!location.port;

    me.initializedEvent = 'init-service-ready';

    var state = {
      localDevMode: localDevMode,
      url: {
        socket: localDevMode ? 'http://localhost:8000' : 'https://socket.sistemium.com',
        auth: 'https://api.sistemium.com/pha',
        jsd: window.localStorage.getItem('JSData.BasePath'),
        v4: 'https://api.sistemium.com/v4',
        api: 'api'
      }
    };

    state.init = function (fn) {
      isInitialized = true;

      if (angular.isFunction(fn)) {
        angular.merge(state, fn(state));
      } else {
        angular.merge(state, fn);
      }

      $rootScope.$broadcast(me.initializedEvent, state);
    };

    state.then = function (fn) {
      return $q(function (resolve) {

        var un;

        function respond() {
          resolve(fn(state));
          if (angular.isFunction(un)) {
            un();
          }
        }

        if (isInitialized) {
          respond();
        } else {
          un = $rootScope.$on(me.initializedEvent, respond);
        }
      });
    };

    return angular.extend(me, state);

  }

  angular.module('core.services')
    .service('InitService', InitService);

})();
