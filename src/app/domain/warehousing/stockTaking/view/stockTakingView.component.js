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
        itemId: '=?',
      },

      controller: StockTakingViewController,

      templateUrl: 'app/domain/warehousing/stockTaking/view/stockTakingView.html',
      controllerAs: 'vm',
      transclude: true

    });


  /** @ngInject */
  function StockTakingViewController(Schema, saControllerHelper, $scope, $q,
                                     toastr, moment, $timeout) {

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

        const { stockTakingId, itemId } = vm;

        if (stockTakingId) {

          const orderBy = [['timestamp', 'DESC']];

          vm.rebindOne(StockTaking, vm.stockTakingId, 'vm.stockTaking');
          vm.rebindAll(StockTakingItem, { stockTakingId, orderBy }, 'vm.stockTakingItems');

          return StockTakingItem.findAll({ stockTakingId })
            .then(() => {
              if (itemId) {
                vm.stockTakingItem = StockTakingItem.get(itemId);
              }
            })

        } else {

          vm.stockTaking = StockTaking.createInstance({
            date: new Date(),
          });

        }


      },

      itemClick(stockTakingItem) {
        _.assign(vm, { stockTakingItem, itemId: stockTakingItem.id });
      },

      onScan({ code }) {

        processBarcode(code);

      },

      itemDeleteClick() {
        vm.stockTakingItem && vm.stockTakingItem.DSDestroy()
          .then(() => vm.stockTakingItem = null);
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
      let barcodedArticle = {};
      let created;

      ArticleBarCode.findAllWithRelations({ code })('Article')

        .then(res => res.length && res || $q.reject(NOT_FOUND))

        .then(res => {
          const articles = _.map(res, 'article');
          const byPackageRel = _.groupBy(articles, 'packageRel');
          const barcodedArticles = _.map(byPackageRel, (items, rel) => ({
            packageRel: parseInt(rel),
            name: ArticleBarCode.meta.commonName(items),
          }));
          barcodedArticle = _.first(barcodedArticles);
        })

        .then(() => !stockTakingId && StockTaking.create(stockTaking)
          .then(() => {
            created = true;
            vm.stockTakingId = stockTaking.id;
          }))

        .then(() => _.get(vm.stockTakingItem, 'barcode') === code
          ? _.assign(vm.stockTakingItem, {
            volume: vm.stockTakingItem.volume + 1,
          })
          : _.assign({
            stockTakingId: stockTaking.id,
            barcode: code,
            volume: 1,
          }, barcodedArticle))

        .then(stockTakingItem => StockTakingItem.create(_.assign(stockTakingItem, {
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
        })))

        .then(stockTakingItem => {
          vm.itemClick(stockTakingItem);
          if (created) {
            $scope.$emit(CREATED_EVENT, stockTaking, stockTakingItem);
          }
        })

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
