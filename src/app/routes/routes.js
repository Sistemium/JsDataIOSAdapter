'use strict';

(function () {

  angular.module('webPage')
    .config(rootStateConfig);

  /** @ngInject */

  function rootStateConfig(stateHelperProvider) {

    stateHelperProvider

      .state({
        name: 'playground',
        url: '/playground',
        templateUrl: 'app/domain/playground/playground.html',
        controller: 'PlayGroundController',
        controllerAs: 'vm',
        data: {
          title: 'Песочница'
        }
      })

      .state({
        name: 'login',
        url: '/login',
        templateUrl: 'app/domain/picker/auth.html',
        controller: 'PickerAuthController',
        controllerAs: 'vm'
      })

      .state({
        name: 'profile',
        url: '/profile',
        templateUrl: 'app/domain/auth/views/profile.html',
        controller: 'AccountController',
        controllerAs: 'vm'
      })

      .state({
        name: 'auth',
        url: '/auth?access-token',
        templateProvider: function ($templateCache, $timeout, $templateRequest) {

          let tpl = getTpl();
          const url = 'app/domain/auth/views/phaAuth.html';

          if (!tpl) {
            return $timeout(100)
              .then(getTpl)
              .then(res => res || $templateRequest(url));
          }

          return tpl;

          function getTpl() {
            return $templateCache.get(url);
          }

        },
        controller: 'PhaAuthController',
        controllerAs: 'vm'
      })

    ;

  }

})();
