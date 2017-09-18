'use strict';

(function () {

  function NewsFeedController($state, Schema, saControllerHelper, $scope, toastr, Sockets, Auth) {

    const {NewsMessage, UserNewsMessage} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      newsRatingClick,
      newsMessageClick,
      createNewsMessageClick,

      isNewsMaker: Auth.isAuthorized(['newsMaker', 'admin']),

      ratings: {}

    });

    vm.onScope('rootClick', () => {
      $state.go('newsFeed');
    });

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    vm.rebindAll(NewsMessage, {
      orderBy: [['ts', 'DESC'], ['deviceCts', 'DESC'], ['dateE', 'DESC']]
    }, 'vm.newsMessages');
    vm.rebindAll(UserNewsMessage, {}, 'vm.userNewsMessages', cacheRatings);

    refresh();

    /*
     Functions
     */

    function refresh() {
      vm.setBusy([
        NewsMessage.findAll(),
        UserNewsMessage.findAll()
      ]);
    }

    function cacheRatings() {

      // vm.ratings = {};

      _.forEach(vm.userNewsMessages, userNewsMessage => {
        vm.ratings[userNewsMessage.newsMessageId] = userNewsMessage.rating;
      })

    }

    function onJSData(event) {

      if (event.resource !== 'NewsMessage' || !event.data) {
        return;
      }

      let {id} = event.data;

      NewsMessage.find(id, {bypassCache: true})
        .then(msg => console.info('updated newsMessage', msg));

    }

    function newsRatingClick(newsMessage) {

      let newsMessageId = newsMessage.id;

      UserNewsMessage.findAll({newsMessageId}, {bypassCache: true})
        .then(userNewsMessages => {

          let userNewsMessage = _.first(userNewsMessages);

          if (!userNewsMessage) {
            let {authId} = Auth.getAccount();
            userNewsMessage = UserNewsMessage.createInstance({newsMessageId, authId});
          }

          userNewsMessage.rating = vm.ratings[newsMessageId];

          UserNewsMessage.create(userNewsMessage)
            .then(() => {
              toastr.success('Ваша оценка принята', 'Спасибо!', {timeOut: 1000});
            })
            .catch(e => console.error(e));

        });

    }

    function createNewsMessageClick() {
      $state.go('.create');
    }

    function newsMessageClick(item) {
      $state.go('.show', {newsMessageId: item.id});
    }


  }

  angular.module('webPage')
    .controller('NewsFeedController', NewsFeedController);

})();
