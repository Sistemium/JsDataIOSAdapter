(function () {

  angular.module('Warehousing')
    .component('stockTakingArticleVolume', {

      bindings: {
        data: '=ngModel',
      },

      templateUrl: 'app/domain/warehousing/stockTaking/articleItem/stockTakingArticleVolume.html',

      controllerAs: 'vm',

    });

})();
