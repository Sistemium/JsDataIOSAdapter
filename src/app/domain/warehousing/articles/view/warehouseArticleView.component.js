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
  function warehouseArticleViewController($scope, Schema, saControllerHelper, $timeout) {

    const vm = saControllerHelper.setup(this, $scope);
    const { WarehouseArticle: Article } = Schema.models();

    vm.use({

      $onInit() {
        vm.rebindOne(Article, vm.articleId, 'vm.article', onArticle);
      },

      removeBarcodeClick,

    });

    function removeBarcodeClick(barcode) {

      if (vm.deleteConfirm === barcode) {
        vm.article.barcodes = _.remove(vm.barcodes, barcode);
        vm.deleteConfirm = false;
        vm.article.DSCreate();
      }

      vm.deleteConfirm = barcode;

      $timeout(5000)
        .then(() => {
          if (vm.deleteConfirm === barcode) {
            vm.deleteConfirm = false;
          }
        });

    }

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
