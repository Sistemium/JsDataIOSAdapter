(function () {

  const CREATED_EVENT = 'stock-taking-created';
  const NOT_FOUND = 'NOT_FOUND';

  angular.module('Warehousing')
    .constant('stockTakingView', {
      destroyEventName: 'stock-taking-view-destroy',
      CREATED_EVENT,
    })
    .component('stockTakingView', {

      bindings: {
        stockTakingId: '=?ngModel',
      },

      controller: StockTakingViewController,

      templateUrl: 'app/domain/warehousing/stockTaking/view/stockTakingView.html',
      controllerAs: 'vm',

    });


  /** @ngInject */
  function StockTakingViewController(Schema, saControllerHelper, $scope, $q,
                                     toastr, moment) {

    const {
      ArticleBarCode,
      BarCodeType,
      // BarcodedArticle,
      StockTaking,
      StockTakingItem,
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      BARCODE_TYPE: BarCodeType.meta.types.BARCODE_TYPE_ARTICLE,

      $onInit() {

        const { stockTakingId } = vm;

        if (stockTakingId) {
          const orderBy = [['timestamp', 'DESC']];

          vm.rebindOne(StockTaking, vm.stockTakingId, 'vm.stockTaking');
          vm.rebindAll(StockTakingItem, { stockTakingId, orderBy }, 'vm.stockTakingItems');

          return StockTakingItem.findAll({ stockTakingId })
        }

        vm.stockTaking = StockTaking.createInstance({
          date: new Date(),
        });

      },

      itemClick(item) {
        vm.stockTakingItem = item;
      },

      onScan({ code }) {

        processBarcode(code);

      },

      deleteClick() {
        (vm.stockTakingId ? vm.stockTaking.DSDestroy() : $q.resolve())
          .then(() => $scope.$emit('stock-taking-view-destroy'));
      },

    });

    /*
    Functions
     */

    function processBarcode(code) {

      const { stockTakingId, stockTaking } = vm;
      let name;

      ArticleBarCode.findAllWithRelations({ code })('Article')

        .then(res => res.length && res || $q.reject(NOT_FOUND))

        .then(res => {
          const articles = _.map(res, 'article');
          name = ArticleBarCode.meta.commonName(articles);
        })

        .then(() => !stockTakingId && StockTaking.create(stockTaking)
          .then(() => {
            $scope.$emit(CREATED_EVENT, stockTaking);
            vm.stockTakingId = stockTaking.id;
          }))

        .then(() => {
          return _.get(vm.stockTakingItem, 'barcode') === code
            ? _.assign(vm.stockTakingItem, {
              volume: vm.stockTakingItem.volume + 1,
            })
            : {
              stockTakingId: stockTaking.id,
              name,
              barcode: code,
              volume: 1,
              timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            };
        })

        .then(stockTakingItem => StockTakingItem.create(stockTakingItem))

        .then(stockTakingItem => _.assign(vm, { stockTakingItem }))

        .catch(e => {
          if (e === NOT_FOUND) {
            toastr.error(code, 'Неизвестный штрих-код');
          } else {
            toastr.error(angular.toJson(e), 'Ошибка');
          }
        });

    }

  }

})();
