(function () {

  const newsMessageRatingsList = {

    bindings: {
      newsMessage: '<',
      popoverOpen: '=?'
    },

    controller: newsMessageRatingsListController,
    templateUrl: 'app/domain/newsFeed/newsMessageRatings/newsMessageRatingsList.html',
    controllerAs: 'vm'

  };

  /** @ngInject */
  function newsMessageRatingsListController(Schema) {

    const {UserNewsMessage, Account} = Schema.models();

    const vm = _.assign(this, {
      $onInit: $onInit
    });

    function $onInit() {

      let filter = {newsMessageId: vm.newsMessage.id, showAll: true};

      Account.findAll();

      UserNewsMessage.findAll(filter, {cacheResponse: false})
        .then(data => {
          vm.userNewsMessages = _.orderBy(data, ['ts', 'DESC']);
        });

    }

  }


  angular.module('webPage')
    .component('newsMessageRatingsList', newsMessageRatingsList);

})();
