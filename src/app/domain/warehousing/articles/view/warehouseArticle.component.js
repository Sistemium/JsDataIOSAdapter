(function () {

  angular.module('Warehousing')
    .component('warehouseArticle', {

      bindings: {
        article: '<ngModel',
      },

      controllerAs: 'vm',
      templateUrl: 'app/domain/warehousing/articles/view/warehouseArticle.html',

    });

})();
