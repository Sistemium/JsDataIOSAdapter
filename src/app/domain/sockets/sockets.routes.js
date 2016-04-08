'use strict';

(function () {

  angular.module('webPage')
    .config(function($stateProvider) {

      $stateProvider
        .state({
          name: 'Sockets',
          url: '/sockets',
          templateUrl: 'app/domain/sockets/sockets.html',
          controller: 'SocketsController',
          controllerAs: 'vm'
        })
      ;

    })
  ;

}());
