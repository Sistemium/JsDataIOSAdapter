'use strict';

(function () {

  function NewsFeedController($state, Schema, saControllerHelper, $scope, toastr, Sockets, Auth, IOS) {

    const {NewsMessage, UserNewsMessage, Account, Commentary, NewsMessagePicture} = Schema.models();

    const SUBSCRIPTIONS = ['NewsMessage', 'Commentary', 'NewsMessagePicture'];

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      newsRatingClick,
      newsMessageClick,
      createNewsMessageClick,
      showCommonRating,

      isAdmin: !IOS.isIos() && Auth.isAuthorized('admin'),
      isNewsMaker: Auth.isAuthorized(['newsMaker', 'admin']),

      ratings: {},
      ratingTitles: NewsMessage.meta.ratingTitles,

      filterActualClick: filterClicker('Actual'),
      filterPastClick: filterClicker('Past'),
      filterFutureClick: filterClicker('Future'),

      filter: 'Actual'

    });

    vm.discloseRatings = vm.isNewsMaker && !IOS.isIos();

    const {authId} = Auth.getAccount();

    vm.onScope('rootClick', () => {
      $state.go('newsFeed');
    });

    const unSubscribeCollections = Sockets.jsDataSubscribe(SUBSCRIPTIONS);
    const unSubscribeJSD = Sockets.onJsData('jsData:update', onJSData);

    $scope.$on('$destroy', Sockets.onJsData('jsData:destroy', onJSDataDestroy));

    let cts = IOS.isIos() ? 'deviceCts' : 'cts';

    vm.rebindAll(UserNewsMessage, {}, 'vm.userNewsMessages', cacheRatings);

    refresh();

    $scope.$on('$destroy', onDestroy);

    /*
     Functions
     */

    function filterClicker(time) {
      return () => {
        vm.filter = time;
        refresh();
      }
    }

    function onDestroy() {
      unSubscribeJSD();
      unSubscribeCollections();
      Commentary.ejectAll();
    }

    function showCommonRating(newsMessage) {
      return newsMessage.rating &&
        (vm.isAdmin || _.get(newsMessage, 'userNewsMessage.rating') || newsMessage.authId === authId);
    }

    function refresh() {

      let options = {bypassCache: true};

      let filter = NewsMessage.meta[`filter${vm.filter}`]({orderBy: [[cts, 'DESC']]});

      vm.rebindAll(NewsMessage, filter, 'vm.newsMessages');

      vm.setBusy([
        Account.findAll({}, options),
        NewsMessage.findAllWithRelations(filter, options)('UserNewsMessage', false, false, options)
      ]);

    }

    function cacheRatings() {

      // vm.ratings = {};

      _.forEach(vm.userNewsMessages, userNewsMessage => {
        vm.ratings[userNewsMessage.newsMessageId] = userNewsMessage.rating;
      })

    }

    function onJSDataDestroy(event) {

      let id = _.get(event, 'data.id');
      let model = Schema.model(event.resource);

      if (!id || !model || SUBSCRIPTIONS.indexOf(event.resource) === -1) {
        return;
      }

      model.eject(id);

    }

    function onJSData(event) {

      const handlers = {onJSDCommentary, onJSDNewsMessage, onJSDNewsMessagePicture};

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

    function onJSDNewsMessagePicture(data) {
      NewsMessagePicture.inject(data);
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
