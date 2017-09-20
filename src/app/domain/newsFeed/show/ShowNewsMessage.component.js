'use strict';

(function () {

  angular.module('webPage')
    .component('showNewsMessage', {

      bindings: {
        newsMessage: '=?'
      },

      templateUrl: 'app/domain/newsFeed/show/showNewsMessage.html',

      controller: ShowNewsMessageController,
      controllerAs: 'vm'

    });


  function ShowNewsMessageController($state, $scope, Schema, saControllerHelper, Auth, toastr) {

    const {NewsMessage, UserNewsMessage} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      newsMessageId: $state.params.newsMessageId,
      isNewsMaker: Auth.isAuthorized(['newsMaker', 'admin']),
      ratingTitles: NewsMessage.meta.ratingTitles,

      editClick,
      $onInit,
      newsRatingClick,
      showCommonRating

    });

    /*
    Init
     */

    const {authId} = Auth.getAccount();

    function $onInit() {

      vm.newsMessageId = vm.newsMessageId || vm.newsMessage.id;

      let newsMessageId = vm.newsMessageId;

      vm.rebindOne(NewsMessage, newsMessageId, 'vm.newsMessage');
      vm.rebindAll(UserNewsMessage, {newsMessageId}, 'vm.userNewsMessages', setRating);

    }

    /*
    Functions
     */

    function showCommonRating() {
      return _.get(vm, 'newsMessage.rating') &&
        (_.get(vm, 'userNewsMessage.rating') || _.get(vm, 'newsMessage.authId') === authId);
    }

    function setRating() {

      let newsMessageId = vm.newsMessageId;

      vm.userNewsMessage = _.first(vm.userNewsMessages) ||
        UserNewsMessage.createInstance({newsMessageId, authId});

    }

    /*
    Handlers
     */

    function newsRatingClick() {

      vm.userNewsMessage.DSCreate()
        .then(() => {
          let msg = `Ваша оценка "${_.upperCase(vm.ratingTitles[vm.userNewsMessage.rating - 1])}" принята`;
          toastr.success(msg, 'Спасибо!', {timeOut: 3000});
        })
        .catch(e => console.error(e));

    }

    function editClick() {

      let newsMessageId = vm.newsMessage.id;
      $state.go('^.edit', {newsMessageId});

    }

  }

})();
