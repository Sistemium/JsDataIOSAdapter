(function (module) {

  const newsMessageRatingsPopover = {

    bindings: {
      newsMessage: '<',
      popoverOpen: '=?'
    },

    transclude: true,
    templateUrl: 'app/domain/newsFeed/newsMessageRatings/newsMessageRatingsPopover.html',
    controllerAs: 'vm'

  };


  module.component('newsMessageRatingsPopover', newsMessageRatingsPopover);

})(angular.module('webPage'));
