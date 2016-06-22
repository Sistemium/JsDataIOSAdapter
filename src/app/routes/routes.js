'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider

        .state({
          name: 'playground',
          url: '/playground',
          templateUrl: 'app/domain/playground/playground.html',
          controller: 'PlayGroundController',
          controllerAs: 'vm'
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
          url: '/auth',
          templateUrl: 'app/domain/auth/views/phaAuth.html',
          controller: 'PhaAuthController',
          controllerAs: 'vm'
        })
      ;

    })
  ;

}());
