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
          title: 'Фотопоток'
        },

        children: [
          {
            name: 'photo',
            url: '/:id',

            templateUrl: 'app/domain/photos/views/photo.html',
            controller: 'PhotoController',
            controllerAs: 'vm',

            data: {
              // hideNavs: true
            }

          }
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
            needCurrent: 'Salesman'
          },

          children: [stream]

        })
      ;

    })
  ;

}());
