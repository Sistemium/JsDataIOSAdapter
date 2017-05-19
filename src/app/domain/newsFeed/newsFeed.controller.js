'use strict';

(function () {

  function NewsFeedController($state, Schema, saControllerHelper, $scope, saApp, toastr) {

    let NewsMessage = Schema.model('NewsMessage');

    const vm = saControllerHelper
      .setup(this, $scope);

    vm.use({
      goToCreateNews,
      showAdditionalInfo,
      onStateChange,
      submitNews,
      clearForm,
      regExForCurrVersion: /^\d{1,2}\.\d{1,2}\.\d{1,2}$/,
      rating: 5,
      //ref
      testHasChanges,
      revertChanges
    });

    $scope.$on('$stateChangeStart', onStateChange);

    vm.onScope('rootClick', () => {
      $state.go('newsFeed');
    });

    /*
     Functions
     */

    function onStateChange(to, params) {

      vm.currentState = to.name.split('.')[1] || to.name;

      if (params && to.name === 'newsFeed.detailed') {
        NewsMessage.find(params.id).then((news) => {
          vm.news = news;
          vm.currVersion = vm.news.appVersion;
        }).catch((e) => {
          if (e.error === 404) {
            toastr.error('Ошибка. Новость не найдена', {timeOut: 30000});
          } else {
            toastr.error('Ошибка сервера', {timeOut: 30000});
          }
        });

        autoresizeTextarea();

      } else if (to.name === 'newsFeed') {
        vm.setBusy(
          NewsMessage.findAll({bypassCache: true}).then((news) => {
            return news;
          })
        ).then(news => {
          vm.news = news;
        }).catch(e => console.error(e));

      } else if (to.name === 'newsFeed.create') {
        vm.currVersion = saApp.version();
        delete vm.news;
      }

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

    function autoresizeTextarea() {

      //TODO: refactor

      angular.element(document).ready(function () {

        vm.formHeight = document.documentElement.clientHeight - document.getElementsByClassName('create-and-edit-news ng-scope')[0].clientHeight;

        document.getElementsByTagName('textarea')[0].style.height = vm.formHeight + 'px';

      });
    }

    function testHasChanges() {
      console.log('fired');
      return NewsMessage.hasChanges($state.params.id);
    }

    function revertChanges() {
      NewsMessage.revert($state.params.id);
    }

    function submitNews() {

      vm.newNews = {
        'body': vm.news.body,
        'subject': vm.news.subject,
        'dateB': vm.news.dateB,
        'dateE': vm.news.dateE,
        'appVersion': vm.currVersion
      };

      NewsMessage.create(vm.newNews).then(() => {

        vm.clearForm();
        delete vm.newNews;
        toastr.success('Новость сохранена', {timeOut: 3000});

      }).catch((e) => {
        console.error(e);
        if (e) {
          toastr.error('Новость не сохранена', {timeOut: 50000});
        }
      })

    }
  }

  angular.module('webPage')
    .controller('NewsFeedController', NewsFeedController);

}());
