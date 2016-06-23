'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      var stream = {
        name: 'stream',
        url: '/stream',

        templateUrl: 'app/domain/photos/views/stream.html',
        controller: 'PhotoStreamController',
        controllerAs: 'vm',

        data: {

        },

        children: [
        ]

      };

      stateHelperProvider
        .state({

          name: 'photos',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',

          data: {
            auth: 'SalesmanAuth',
            needRole: 'salesman',
            hideTopBar: true,
            needCurrent: 'Salesman'
          },

          children: [stream]

        })
      ;

    })
  ;

}());
