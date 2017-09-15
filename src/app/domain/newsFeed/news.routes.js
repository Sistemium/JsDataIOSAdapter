(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider.state({

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
          template: '<edit-news-message></edit-news-message>',

          data: {
            title: 'Добавление новости',
            rootState: 'newsFeed'
          }

        }, {

          name: 'show',
          url: '/:newsMessageId',
          template: '<show-news-message></show-news-message>',

          data: {
            title: 'Новость',
            rootState: 'newsFeed'
          }

        }, {

          name: 'edit',
          url: '/:newsMessageId/edit',
          template: '<edit-news-message></edit-news-message>',

          data: {
            title: 'Редактирование новости',
            rootState: 'newsFeed'
          }

        }]


      });
    });

})();
