(function () {

  angular.module('webPage')
    .component('warehouseArticle', {

      bindings: {
        article: '<ngModel',
      },

      controllerAs: 'vm',
      templateUrl: 'app/domain/components/warehouseArticle/warehouseArticle.html',

    });

})();
