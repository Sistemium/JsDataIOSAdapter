'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      const stream = {
        name: 'stream',
        url: '/stream',

        templateUrl: 'app/domain/photos/views/stream.html',
        controller: 'PhotoStreamController',
        controllerAs: 'vm',

        data: {
          title: 'Фотопоток'
        }

      };

      stateHelperProvider
        .state({

          name: 'photos',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',

          data: {
            auth: 'SalesmanAuth'
          },

          children: [stream]

        })
      ;

    })
  ;

})();
