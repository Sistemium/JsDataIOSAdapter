'use strict';

(function () {

  function NewsFeedController($state, Schema, saControllerHelper, $scope, saApp, toastr, Sockets, Auth) {

    let NewsMessage = Schema.model('NewsMessage');
    let UserNewsMessage = Schema.model('UserNewsMessage');

    const vm = saControllerHelper
      .setup(this, $scope);

    vm.use({
      goToCreateNews,
      showAdditionalInfo,
      onStateChange,
      submitNews,
      clearForm,
      saveRating,
      isAdmin: Auth.isAdmin(),
      regExForCurrVersion: /^\d{1,2}\.\d{1,2}\.\d{1,2}$/,

      editNews,
      updateNews,
      newsHasChanges,
      revertChanges

    });

    $scope.$on('$stateChangeStart', onStateChange);

    vm.onScope('rootClick', () => {
      $state.go('newsFeed');
    });

    $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

    /*
     Functions
     */

    function onJSData(event) {

      if (event.resource !== 'NewsMessage') {
        return;
      }

      let id = event.data.id;

      NewsMessage.find(id, {bypassCache: true})
        .then(msg => console.info('updated newsMessage', msg));

    }

    function onStateChange(to, params) {

      vm.currentState = to.name.split('.')[1] || to.name;

      if (params && (vm.currentState === 'edit' || vm.currentState === 'detailed')) {

        NewsMessage.find(params.id).then((news) => {
          vm.news = news;
          UserNewsMessage.findAll();
        }).catch((e) => {
          if (e.error === 404) {
            toastr.error('Ошибка. Новость не найдена', {timeOut: 5000});
          } else {
            toastr.error('Ошибка сервера', {timeOut: 5000});
          }
        });

      } else if (to.name === 'newsFeed') {

        vm.setBusy(
          NewsMessage.findAll({}, {bypassCache: true})
        )
          .then(news => {
            vm.rebindAll(NewsMessage, {}, 'vm.news');
            return UserNewsMessage.findAll();
          })
          .catch(e => console.error(e));

      } else if (to.name === 'newsFeed.create') {
        vm.news = {};
        vm.news.appVersion = saApp.version();
      }

    }

    function saveRating(ev, val, id) {

      let numericRating = val || undefined;

      if (!val) {

        let writtenRating = ev.srcElement.title;

        switch (writtenRating) {
          case 'Один':
            numericRating = 1;
            break;
          case 'Два':
            numericRating = 2;
            break;
          case 'Три':
            numericRating = 3;
            break;
          case 'Четыре':
            numericRating = 4;
            break;
          case 'Пять':
            numericRating = 5;
            break;
          default:
            numericRating = null;

        }

      }

      UserNewsMessage.findAll({newsMessageId: id}, {bypassCache: true}).then((rating) => {

        let ratingId = rating.length ? _.first(rating).id : undefined;
        let recordRating = rating.length ? _.first(rating).rating : 0;

        if (numericRating && (recordRating !== numericRating)) {

          let objToWrite = ratingId ? {id: ratingId, rating: numericRating, newsMessageId: id} : {
            rating: numericRating,
            newsMessageId: id
          };

          UserNewsMessage.create(objToWrite).then(() => {
            toastr.success('Ваша оценка принята', {timeOut: 1000});
          });

        }

      });


      ev.stopPropagation();

    }

    function goToCreateNews() {
      $state.go('.create');
    }

    function showAdditionalInfo(item) {
      $state.go('.detailed', {id: item.id});
    }

    function clearForm() {
      vm.newsFeedForm.$setPristine();
      delete vm.news;
    }

    function newsHasChanges() {
      return NewsMessage.hasChanges($state.params.id);
    }

    function revertChanges() {
      NewsMessage.revert($state.params.id);
    }

    function editNews() {
      $state.go('^.edit', {id: $state.params.id});
    }

    function updateNews() {

      vm.news.id = $state.params.id;

      NewsMessage.create(vm.news).then(() => {

        toastr.success('Новость обновлена', {timeOut: 3000});

      }).catch((e) => {
        console.error(e);
        if (e) {
          toastr.error('Новость не обновлена', {timeOut: 5000});
        }
      })

    }

    function submitNews() {

      vm.newNews = {
        'body': vm.news.body,
        'subject': vm.news.subject,
        'dateB': vm.news.dateB,
        'dateE': vm.news.dateE,
        'appVersion': vm.news.appVersion
      };

      NewsMessage.create(vm.newNews).then(() => {

        vm.clearForm();
        delete vm.newNews;
        toastr.success('Новость сохранена', {timeOut: 3000});

      }).catch((e) => {
        console.error(e);
        if (e) {
          toastr.error('Новость не сохранена', {timeOut: 5000});
        }
      })

    }
  }

  angular.module('webPage')
    .controller('NewsFeedController', NewsFeedController);

})();
