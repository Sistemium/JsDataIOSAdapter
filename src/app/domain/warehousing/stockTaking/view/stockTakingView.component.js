(function () {

  const CREATED_EVENT = 'stock-taking-created';
  const DESTROY_EVENT = 'stock-taking-view-destroy';
  const NOT_FOUND = 'NOT_FOUND';

  angular.module('Warehousing')
    .constant('stockTakingView', {
      DESTROY_EVENT,
      CREATED_EVENT,
    })
    .component('stockTakingView', {

      bindings: {
        stockTakingId: '=?ngModel',
        itemId: '=?',
        tab: '=?'
      },

      controller: StockTakingViewController,

      templateUrl: 'app/domain/warehousing/stockTaking/view/stockTakingView.html',
      controllerAs: 'vm',
      transclude: true

    });


  /** @ngInject */
  function StockTakingViewController(Schema, saControllerHelper, $scope, $q,
                                     toastr, moment, BarCodeScanner, StockTakingData,
                                     SoundSynth, Language, Sockets, DEBUG) {

    const {
      Article,
      BarCodeType,
      WarehouseStock,
      StockTaking,
      StockTakingItem,
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    const { BARCODE_SCAN_EVENT } = BarCodeScanner;

    const tabs = ['scans', 'stats', 'stocks'];

    vm.use({

      BARCODE_TYPE: BarCodeType.meta.types.BARCODE_TYPE_ARTICLE,

      $onInit() {

        const { stockTakingId, itemId } = vm;

        setActiveTabIndex();

        $scope.$on(BARCODE_SCAN_EVENT, (e, { code }) => vm.onScan({ code }));

        vm.watchScope('vm.activeTabIndex', idx => {

          if (!_.isNumber(idx)) return;

          vm.tab = tabs[idx || 0];

        });

        $scope.$on('$destroy', Sockets.jsDataSubscribe(['StockTakingItem', 'Stock']));
        $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));
        $scope.$on('$destroy', Sockets.onJsData('jsData:updateCollection', onJSDataCollection));

        if (stockTakingId) {

          vm.rebindOne(StockTaking, vm.stockTakingId, 'vm.stockTaking');

          const busy = StockTakingItem.findAll({ stockTakingId }, { bypassCache: true })
            .then(() => {
              if (itemId) {
                vm.stockTakingItem = StockTakingItem.get(itemId);
              }
              return StockTakingData({ stockTakingId }).promise;
            })
            .then(stockTakingData => {
              $scope.$watch(() => StockTakingItem.lastModified(), () => {
                makeStocks(stockTakingData);
              });
              makeStocks(stockTakingData);
              $scope.$on('$destroy', () => StockTakingData({ stockTakingId }).clearCache());
            })
            .then(() => {
              return StockTakingItem.findAllWithRelations({ stockTakingId })('Article')
            });

          return vm.setBusy(busy);

        } else {

          vm.stockTaking = StockTaking.createInstance({
            date: new Date(),
          });

          vm.watchScope('vm.stockTaking.warehouseId', onStockUpdate);

        }

      },

      itemClick(stockTakingItem) {
        _.assign(vm, { stockTakingItem, itemId: stockTakingItem.id });
      },

      onScan({ code }) {

        processBarcode(code);

      },

      deleteClick() {
        (vm.stockTakingId ? vm.stockTaking.DSDestroy() : $q.resolve())
          .then(() => $scope.$emit(DESTROY_EVENT));
      },

      itemListScrollTo() {
      },

      itemStatsScrollTo() {
      },

    });

    /*
    Functions
     */

    function setActiveTabIndex() {
      const idx = tabs.indexOf(vm.tab);
      vm.activeTabIndex = idx >= 0 ? idx : 0;
    }

    function makeStocks(stockTakingData) {

      let { stocks } = stockTakingData;

      const stockTaking = StockTaking.get(vm.stockTakingId);

      const fields = ['id', 'article', 'articleId', 'volume'];
      const itemsByArticleId = _.groupBy(stockTaking.items, 'articleId');

      stocks = _.map(stocks, stock => {
        const res = _.pick(stock, fields);
        const foundVolume = _.sumBy(itemsByArticleId[stock.articleId], 'volume') || 0;
        return _.assign(res, {
          foundVolume,
          volumeRemains: stock.volume - foundVolume,
        });
      });

      stocks = _.filter(stocks, 'volumeRemains');

      vm.stocks = _.orderBy(stocks, 'article.name');

    }

    function processBarcode(code) {

      const { stockTakingId, stockTaking } = vm;

      if (!stockTaking.isValid()) {
        return toastr.info('Выберите "Склад" прежде чем начать сканирование');
      }

      let barcodedArticle = {};
      let created;

      const where = {
        barcode: {
          likei: `%"${code}"%`,
        },
      };

      Article.findAll({ where })

        .then(res => res.length && res || $q.reject(NOT_FOUND))

        .then(articles => {
          if (articles.length > 1) {
            return new Error(`Больше одного товара со штрих-кодом: [${code}]`);
          }
          return _.first(articles);
        })

        .then(article => {
          barcodedArticle = { articleId: article.id, packageRel: article.packageRel };
        })

        .then(() => !stockTakingId && StockTaking.create(stockTaking)
          .then(() => {
            created = true;
            vm.stockTakingId = stockTaking.id;
          }))

        .then(() => (_.get(vm.stockTakingItem, 'barcode') === code && vm.itemId)
          ? _.assign(vm.stockTakingItem, {
            volume: vm.stockTakingItem.volume + 1,
          })
          : _.assign({
            stockTakingId: stockTaking.id,
            barcode: code,
            volume: 1,
          }, barcodedArticle))

        .then(stockTakingItem => StockTakingItem.create(_.assign(stockTakingItem, {
          timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS'),
        })))

        .then(stockTakingItem => {
          speakSuccess(stockTakingItem);
          vm.itemClick(stockTakingItem);
          scrollTo(stockTakingItem);
          if (created) {
            $scope.$emit(CREATED_EVENT, stockTaking, stockTakingItem);
          }
        })

        .catch(e => {
          if (e === NOT_FOUND) {
            toastr.error(code, 'Неизвестный штрих-код');
            speakNotFound();
          } else {
            toastr.error(angular.toJson(e), 'Ошибка');
          }
        });

    }

    function scrollTo(item) {
      switch (vm.activeTabIndex) {
        case 0:
          return vm.itemListScrollTo(item);
        case 1:
          return vm.itemStatsScrollTo(item);
      }
    }

    function speakSuccess(stockTakingItem) {
      const { volume, article } = stockTakingItem;
      const say = Language.speakableBoxPcs(article.boxPcs(volume, true));
      SoundSynth.say(`${volume === 1 ? article.firstName : ''} ${say}`);
    }

    function speakNotFound() {
      SoundSynth.say(`Неизвестный штрих-код`);
    }

    function onJSDataCollection(event) {

      DEBUG('stockTakingView onJSDataCollection', event);

      switch (event.resource) {
        // case 'StockTakingItem':
        //   return onJSDataInject(event);
        case 'Stock':
          return onStockUpdate(event);
      }

    }

    const debounceStockUpdate = _.debounce(onStockUpdate, 500);

    function onJSData(event) {

      // console.warn(event);

      switch (event.resource) {
        case 'StockTakingItem':
          return onJSDataInject(event);
        case 'Stock':
          return debounceStockUpdate(event);
      }

    }

    function onStockUpdate() {

      DEBUG('stockTakingView onStockUpdate', event);

      const { warehouseId } = vm.stockTaking;

      if (!warehouseId) {
        return;
      }

      WarehouseStock.groupBy({ warehouseId }, ['warehouseId'])
        .then(_.first)
        .then(res => {
          vm.stocksTs = res ? (res['max(ts)'] || res['max(lts)']) : null;
        });

    }

    function onJSDataInject({ resource, data }) {
      let model = Schema.model(resource);

      if (data.name) {
        model.inject(data);
      } else {
        model.find(data.id, { bypassCache: true });
      }
    }

  }

})();
