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

      $onInit,
      editClick,
      newsRatingClick,

      isNewsMaker: Auth.isAuthorized(['newsMaker', 'admin', 'supervisor'])

    });

    /*
    Functions
     */

    function newsRatingClick() {
      vm.userNewsMessage.DSCreate()
        .then(() => {
          toastr.success('Ваша оценка принята', {timeOut: 1000});
        })
        .catch(e => console.error(e));
    }

    function editClick() {
      let newsMessageId = vm.newsMessage.id;
      $state.go('^.edit', {newsMessageId});
    }

    function $onInit() {
      let newsMessageId = $state.params.newsMessageId;
      vm.rebindOne(NewsMessage, newsMessageId, 'vm.newsMessage');
      vm.rebindAll(UserNewsMessage, {newsMessageId}, 'vm.userNewsMessages', setRating);
    }

    function setRating() {
      if (!vm.newsMessage) return;
      let newsMessageId = vm.newsMessage.id;
      vm.userNewsMessage = vm.newsMessage.userNewsMessage || UserNewsMessage.createInstance({newsMessageId});
    }

  }

})();
