(function () {

  angular.module('Warehousing')
    .component('stockTakingArticleItemList', {

      bindings: {
        items: '<',
        activeId: '=',
        onClick: '&',
      },

      templateUrl: 'app/domain/warehousing/stockTaking/articleItem/stockTakingArticleItemList.html',

      controllerAs: 'vm',
      controller() {
        this.itemClick = $item => this.onClick({ $item });
      }

    });

})();
