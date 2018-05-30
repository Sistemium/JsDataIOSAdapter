(function () {

  angular.module('Warehousing')
    .component('stockBatching', {

      bindings: {},

      controller: StockBatchingController,

      templateUrl: 'app/domain/warehousing/stockBatching/stockBatching.html',
      controllerAs: 'vm',

    });

  /** @ngInject */
  function StockBatchingController(Schema, saControllerHelper, $scope, toastr, $q) {

    const {
      StockBatch,
      // StockBatchBarCode,
      ArticleBarCode,
      BarCodeScan,
      StockBatchItem,
      // BarCodeType
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope).use({

      $onInit() {
        vm.barcode = {};
        vm.setState('article');
      },

      createClick() {
        vm.stockBatch = StockBatch.createInstance({ site: 1, volume: 0 });
        vm.setState('');
        vm.barcodes = [];
        // vm.rebindAll(BarCodeScan, {}, 'barcodes');
      },

      setState(name) {

        vm.barcode = {};

        return vm.watchScope('vm.barcode', (() => {
          switch (name) {
            case 'article':
              return findArticle;
            default:
              return addBarcode;
          }
        })());

      },

    });

    function findArticle({ code, type }) {

      if (!code) {
        return;
      }

      if (!type || type.type !== 'Article') {
        toastr.error('Неправильный штрих-код');
        return;
      }

      return ArticleBarCode.findAll({ code })
        .then(res => _.first(res) || $q.reject('Not found'))
        .then(ab => ab.DSLoadRelations())
        .then(({ article }) => _.assign(vm, {
          article,
          lastCode: vm.barcode.code,
        }))
        .catch(() => toastr.info('Неизвестный штрих-код'));

    }

    function addBarcode({ code, type }) {

      if (!type) return;

      const save = vm.stockBatch.id ? $q.resolve(vm.stockBatch) : StockBatch.create(vm.stockBatch);

      return save
        .then(({ id: stockBatchId }) =>
          BarCodeScan.create({ destinationXid: stockBatchId, code })
            .then(scan => vm.barcodes.push(scan))
            .then(() => StockBatchItem.create({ stockBatchId, volume: 1, barcode: code }))
        )
        .catch(e => toastr.error(angular.toJson(e), 'Ошибка!'));

    }

  }

})();
