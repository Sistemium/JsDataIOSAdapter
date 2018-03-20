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
        templateProvider: function ($templateCache, $timeout) {

          let tpl = getTpl();

          if (!tpl) {
            return $timeout(100)
              .then(getTpl);
          }

          return tpl;

          function getTpl() {
            return $templateCache.get('app/domain/auth/views/phaAuth.html');
          }

        },
        controller: 'PhaAuthController',
        controllerAs: 'vm'
      })

    ;

  }

})();
