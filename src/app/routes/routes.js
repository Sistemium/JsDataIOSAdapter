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
          url: '/auth',
          templateUrl: 'app/domain/auth/views/phaAuth.html',
          controller: 'PhaAuthController',
          controllerAs: 'vm'
        })

        .state({
          name: 'newsFeed',
          url: '/newsFeed',
          templateUrl: 'app/domain/newsFeed/newsFeed.html',
          controller: 'NewsFeedController',
          controllerAs: 'vm',
          data: {
            title: 'Лента новостей'
          },

          children: [{
            name: 'create',
            url: '/create',
            templateUrl: 'app/domain/newsFeed/createAndEditNews.html',
            controller: 'NewsFeedController',
            controllerAs: 'vm',

            data: {
              title: 'Создать новость'
            }

          }, {
            name: 'detailed',
            url: '/:id',
            templateUrl: 'app/domain/newsFeed/detailedView.html',
            controller: 'NewsFeedController',
            controllerAs: 'vm',

            data: {
              title: 'Новость'
            }

          }, {
            name: 'edit',
            url: '/:id/edit',
            templateUrl: 'app/domain/newsFeed/createAndEditNews.html',
            controller: 'NewsFeedController',
            controllerAs: 'vm',

            data: {
              title: 'Редактирование новости'
            }

          }

          ]


        });

    });

})();
