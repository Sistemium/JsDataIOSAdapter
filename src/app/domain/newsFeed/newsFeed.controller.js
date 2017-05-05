'use strict';

(function () {

  function NewsFeedController(Schema, saApp) {

    var NewsMessage = Schema.model('NewsMessage');

    const vm = _.assign(this, {
      submitNews,
      clearForm
    });

    /*
     Listeners
     */

    /*
     Functions
     */

    function clearForm() {
      vm.newsFeedForm.$setPristine();
      delete vm.news;
    }

    function submitNews() {
      vm.newNews = {
        'body': vm.news.body,
        'subject': vm.news.subject,
        'dateB': vm.news.beginDate,
        'dateE': vm.news.endDate,
        'appVersion': saApp.version()
      };

      NewsMessage.create(vm.newNews).then(() => {
        vm.clearForm();
        delete vm.newNews;
      })
    }

  }

  angular.module('webPage')
    .controller('NewsFeedController', NewsFeedController);

}());
