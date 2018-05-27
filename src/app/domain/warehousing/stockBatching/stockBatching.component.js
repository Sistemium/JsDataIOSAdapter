(function () {

  angular.module('Warehousing')
    .component('stockBatching', {

      bindings: {},

      controller: StockBatchingController,

      templateUrl: 'app/domain/warehousing/stockBatching/stockBatching.html',
      controllerAs: 'vm',

    });

  function StockBatchingController(Schema, saControllerHelper, $scope, toastr) {

    const { StockBatch, StockBatchBarCode, ArticleBarCode } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope).use({

      $onInit() {
        vm.barcode = {};
        vm.watchScope('vm.barcode.code', findArticle);
      },

      createClick() {

        vm.stockBatch = StockBatch.createInstance({ site: 1, volume: 0 });

      },

    });

    function findArticle(code) {

      if (!code) return;

      ArticleBarCode.findAll({ code })
        .then(res => _.first(res) || Promise.reject('Not found'))
        .then(ab => ab.DSLoadRelations())
        .then(({ articleId }) => {
          _.assign(vm.stockBatch, { articleId });
          vm.barcode = {};
          vm.watchScope('vm.barcode.code', addBarcode);
        })
        .catch(() => toastr.info('Неизвестный штрих-код'));

    }

    function addBarcode(code) {

      if (!code) return;

      if (code.length < 6) {
        console.info(code.length);
        return;
      }

      vm.stockBatch.DSCreate()
        .then(({ id: stockBatchId }) =>
          StockBatchBarCode.create({ stockBatchId, code })
        );

    }

  }

})();
