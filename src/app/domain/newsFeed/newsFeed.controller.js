'use strict';

(function () {

  function NewsFeedController($state, Schema, saControllerHelper, $scope, toastr, Sockets, Auth, IOS) {

    const {NewsMessage, UserNewsMessage, Account} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      newsRatingClick,
      newsMessageClick,
      createNewsMessageClick,
      showCommonRating,

      isAdmin: !IOS.isIos() && Auth.isAuthorized('admin'),
      isNewsMaker: Auth.isAuthorized(['newsMaker', 'admin']),

      ratings: {},
      ratingTitles: NewsMessage.meta.ratingTitles

    });

    const {authId} = Auth.getAccount();

    vm.onScope('rootClick', () => {
      $state.go('newsFeed');
    });

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    let cts = IOS.isIos() ? 'deviceCts' : 'cts';

    let filter = NewsMessage.meta.filterActual({orderBy: [[cts, 'DESC']]});

    vm.rebindAll(NewsMessage, filter, 'vm.newsMessages');
    vm.rebindAll(UserNewsMessage, {}, 'vm.userNewsMessages', cacheRatings);

    refresh();

    /*
     Functions
     */

    function showCommonRating(newsMessage) {
      return newsMessage.rating &&
        (vm.isAdmin || _.get(newsMessage, 'userNewsMessage.rating') || newsMessage.authId === authId);
    }

    function refresh() {
      vm.setBusy([
        Account.findAll({}, {bypassCache: true}),
        NewsMessage.findAll({}, {bypassCache: true}),
        UserNewsMessage.findAll({}, {bypassCache: true})
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
              let msg = `Ваша оценка "${_.upperCase(vm.ratingTitles[userNewsMessage.rating - 1])}" принята`;
              toastr.success(msg, 'Спасибо!', {timeOut: 3000});
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
