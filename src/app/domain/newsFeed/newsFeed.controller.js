'use strict';

(function () {

  function NewsFeedController($state, Schema, saControllerHelper, $scope, toastr, Sockets, Auth, IOS) {

    const {NewsMessage, UserNewsMessage, Account, Commentary} = Schema.models();

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

    vm.discloseRatings = vm.isNewsMaker && !IOS.isIos();

    const {authId} = Auth.getAccount();

    vm.onScope('rootClick', () => {
      $state.go('newsFeed');
    });

    const unSubscribeJSD = Sockets.onJsData('jsData:update', onJSData)

    let cts = IOS.isIos() ? 'deviceCts' : 'cts';

    let filter = NewsMessage.meta.filterActual({orderBy: [[cts, 'DESC']]});

    vm.rebindAll(NewsMessage, filter, 'vm.newsMessages');
    vm.rebindAll(UserNewsMessage, {}, 'vm.userNewsMessages', cacheRatings);

    refresh();

    $scope.$on('$destroy', onDestroy);

    /*
     Functions
     */

    function onDestroy() {
      unSubscribeJSD();
      Commentary.ejectAll();
    }

    function showCommonRating(newsMessage) {
      return newsMessage.rating &&
        (vm.isAdmin || _.get(newsMessage, 'userNewsMessage.rating') || newsMessage.authId === authId);
    }

    function refresh() {
      let options = {bypassCache: true};
      vm.setBusy([
        Account.findAll({}, {bypassCache: true}),
        NewsMessage.findAllWithRelations(filter, options)('UserNewsMessage', false, false, options)
      ]);
    }

    function cacheRatings() {

      // vm.ratings = {};

      _.forEach(vm.userNewsMessages, userNewsMessage => {
        vm.ratings[userNewsMessage.newsMessageId] = userNewsMessage.rating;
      })

    }

    function onJSData(event) {

      const handlers = {onJSDCommentary, onJSDNewsMessage};

      let handler = handlers[`onJSD${event.resource}`];

      if (!event.data || !handler) {
        return;
      }

      handler(event.data);

    }

    function onJSDCommentary(data) {
      Commentary.inject(data);
    }

    function onJSDNewsMessage(data) {
      NewsMessage.inject(data);
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
