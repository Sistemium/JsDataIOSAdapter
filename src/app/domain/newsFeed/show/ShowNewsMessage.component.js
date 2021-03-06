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


  function ShowNewsMessageController($state, $scope, Schema, saControllerHelper, Auth, toastr, saEtc, moment, $timeout,
                                     GalleryHelper) {

    const {NewsMessage, UserNewsMessage, Commentary, NewsMessagePicture} = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    GalleryHelper.setupController(vm, $scope);

    vm.use({

      newsMessageId: $state.params.newsMessageId,
      isNewsMaker: Auth.isAuthorized(['newsMaker', 'admin']),
      ratingTitles: NewsMessage.meta.ratingTitles,

      editClick,
      $onInit,
      newsRatingClick,
      showCommonRating,
      onCommentarySubmit,
      thumbClick,
      pictureRemoveClick

    });

    /*
    Init
     */

    const {authId} = Auth.getAccount();

    function $onInit() {

      vm.newsMessageId = vm.newsMessageId || vm.newsMessage.id;

      let newsMessageId = vm.newsMessageId;

      vm.rebindOne(NewsMessage, newsMessageId, 'vm.newsMessage', loadChildren);
      vm.watchScope('vm.busySavingPicture', onBusySavingPicture);

      NewsMessage.find(newsMessageId);

    }

    /*
    Functions
     */

    function loadChildren() {

      let newsMessageId = vm.newsMessageId;
      let where = {ownerXid: {'==': newsMessageId}};
      let orderBy = [['timestamp', 'DESC']];
      let filter = {newsMessageId};

      Commentary.findAll({where})
        .catch(() => vm.disableCommentaries = true)
        .then(() => {
          UserNewsMessage.findAll(filter)
        })
        .then(() => {
          vm.rebindAll(Commentary, {where, orderBy}, 'vm.commentaries', setLast);
          vm.rebindAll(UserNewsMessage, filter, 'vm.userNewsMessages', setRating);
        });

      NewsMessagePicture.findAll(filter);
      vm.rebindAll(NewsMessagePicture, {newsMessageId}, 'vm.newsMessagePictures');

      createNewsMessagePicture();
      initCommentary();

    }

    function setLast() {
      vm.lastReadCommentaries = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    }

    function pictureRemoveClick(picture) {

      if (vm.confirmation === picture.id) {
        let promise = picture.DSDestroy()
          .then(cleanup);

        vm.cgBusy = {promise, message: 'Удаление изображения'};

        return;
      }

      vm.confirmation = picture.id;

      $timeout(2000)
        .then(cleanup);

      function cleanup() {
        if (picture.id === vm.confirmation) {
          vm.confirmation = false;
        }
      }

    }

    function thumbClick(picture) {

      $scope.imagesAll = vm.newsMessagePictures;

      vm.commentText = vm.newsMessage.subject;
      vm.thumbnailClick(picture);

    }

    function onBusySavingPicture(promise) {

      if (!promise || !promise.then) {
        return;
      }

      vm.cgBusy = {promise, message: 'Сохранение изображения'};

      promise.then(createNewsMessagePicture);

    }

    function createNewsMessagePicture() {
      vm.newsMessagePicture = NewsMessagePicture.createInstance({newsMessageId: vm.newsMessageId});
    }

    function scrollComments() {

      let elem = saEtc.getElementById('bodyScroll');

      if (elem) {
        elem.scrollTop = 0;
      }

    }

    function initCommentary() {
      vm.commentary = Commentary.createInstance({
        ownerXid: vm.newsMessageId,
        source: 'NewsMessage',
        authId
      });
    }

    function onCommentarySubmit() {
      vm.commentary.timestamp = moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS');
      vm.commentary.DSCreate()
        .then(initCommentary)
        .then(() => $timeout(100))
        .then(scrollComments);
    }

    function showCommonRating() {
      return _.get(vm, 'newsMessage.rating') &&
        (_.get(vm, 'userNewsMessage.rating') || _.get(vm, 'newsMessage.authId') === authId);
    }

    function setRating() {

      let newsMessageId = vm.newsMessageId;

      vm.userNewsMessage = _.first(vm.userNewsMessages) ||
        UserNewsMessage.createInstance({newsMessageId, authId});

      vm.userNewsMessage.lastReadCommentaries = vm.lastReadCommentaries;

      let createFirst = vm.newsMessage.isAuthor() && !vm.userNewsMessage.id;

      if (createFirst || vm.userNewsMessage.id && vm.userNewsMessage.DSHasChanges()) {
        vm.userNewsMessage.DSCreate();
      }

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
