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
  function warehouseArticleViewController($scope, Schema, saControllerHelper, $timeout,
                                          SoundSynth) {

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
        vm.article.barcodes = _.filter(vm.barcodes, x => x !== barcode);
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

      const { barcodes = [], id: lastArticleId } = vm.article;

      vm.barcodes = barcodes;

      if (vm.lastArticleId === lastArticleId) {
        return;
      }

      vm.lastArticleId = lastArticleId;

      if (barcodes.length) {
        sayHasBarcode();
      } else {
        sayNeedBarcode();
      }

      // ArticleBarCode.findAll({ articleId }, { bypassCache: true });
      // vm.rebindAll(ArticleBarCode, { articleId }, 'vm.barcodes');

    }

    function sayNeedBarcode() {
      SoundSynth.say(`Нет штрих-кода, просканируйте`);
    }

    function sayHasBarcode() {
      SoundSynth.say(`У товара есть штрих-код`);
    }

  }

})();
