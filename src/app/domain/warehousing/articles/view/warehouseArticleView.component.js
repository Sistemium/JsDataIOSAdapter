(function () {

  angular.module('Warehousing')
    .component('warehouseArticleView', {

      bindings: {
        articleId: '=ngModel',
      },

      templateUrl: 'app/domain/warehousing/articles/view/warehouseArticleView.html',
      controllerAs: 'vm',
      controller: warehouseArticleViewController,

    });

  /** @ngInject */
  function warehouseArticleViewController($scope, Schema, saControllerHelper) {

    const vm = saControllerHelper.setup(this, $scope);
    const { WarehouseArticle: Article } = Schema.models();

    vm.use({
      $onInit() {
        vm.rebindOne(Article, vm.articleId, 'vm.article', onArticle);
      },
    });

    function onArticle() {

      if (!vm.article) {
        return;
      }

      const { barcodes } = vm.article;

      vm.barcodes = barcodes;

      // ArticleBarCode.findAll({ articleId }, { bypassCache: true });
      // vm.rebindAll(ArticleBarCode, { articleId }, 'vm.barcodes');

    }

  }

})();
