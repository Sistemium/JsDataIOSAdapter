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
                                     SoundSynth, Language, Sockets, DEBUG, StockTakingExport,
                                     IOS, ConfirmModal) {

    const {
      Article,
      BarCodeType,
      WarehouseStock,
      StockTaking,
      StockTakingItem,
    } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    const { BARCODE_SCAN_EVENT, BARCODE_SCAN_INVALID } = BarCodeScanner;

    const tabs = ['scans', 'stats', 'stocks'];

    vm.use({

      BARCODE_TYPE: BarCodeType.meta.types.BARCODE_TYPE_ARTICLE,

      $onInit() {

        const { stockTakingId, itemId } = vm;

        setActiveTabIndex();

        $scope.$on(BARCODE_SCAN_EVENT, (e, { code }) => vm.onScan({ code }));
        $scope.$on(BARCODE_SCAN_INVALID, sayInvalid);

        vm.watchScope('vm.activeTabIndex', idx => {

          if (!_.isNumber(idx)) return;

          vm.tab = tabs[idx || 0];

        });

        $scope.$on('$destroy', Sockets.jsDataSubscribe(['StockTakingItem', 'WarehouseStock']));
        $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));
        $scope.$on('$destroy', Sockets.onJsData('jsData:updateCollection', onJSDataCollection));

        if (stockTakingId) {

          vm.watchScope('vm.search', () => vm.stockTakingData && makeStocks(vm.stockTakingData));

          return vm.setBusy(loadData(stockTakingId, itemId));

        } else {

          vm.stockTaking = StockTaking.createInstance({
            date: new Date(),
          });

          vm.watchScope('vm.stockTaking.warehouseId', onStockUpdate);

        }

      },

      exportable: !IOS.isIos(),

      itemClick(stockTakingItem) {
        _.assign(vm, { stockTakingItem, itemId: stockTakingItem.id });
      },

      articleClick(articleId) {
        const { stockTakingId } = vm;
        // const stockTakingData = StockTakingData({ stockTakingId });
        const items = StockTakingItem.filter({ articleId, stockTakingId });
        // vm.stockTakingArticle = stockTakingData.resultByArticle(items, articleId);
        if (items.length) {
          vm.itemClick(_.maxBy(items, 'timestamp'));
        } else {
          addWithoutBarcode(articleId);
        }
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

      exportClick() {
        StockTakingExport.asExcel({
          stockTaking: vm.stockTaking,
          stocks: vm.stockTakingData.stocks
        });
      }

    });

    /*
    Functions
     */

    function loadData(stockTakingId, itemId) {

      vm.rebindOne(StockTaking, vm.stockTakingId, 'vm.stockTaking');
      // vm.watchScope('vm.itemId', (ev, itemId) => {
      //   if (!itemId) {
      //     vm.stockTakingItem = null;
      //   }
      // });

      return StockTakingItem.findAll({ stockTakingId }, { bypassCache: true })
        .then(() => {
          if (itemId) {
            vm.stockTakingItem = StockTakingItem.get(itemId);
          }
          return StockTakingData({ stockTakingId }).promise;
        })
        .then(stockTakingData =>
          StockTakingItem.findAllWithRelations({ stockTakingId })('Article')
            .then(() => stockTakingData)
        )
        .then(stockTakingData => {
          $scope.$watch(() => StockTakingItem.lastModified(), () => {
            makeStocks(stockTakingData);
          });
          makeStocks(stockTakingData);
          $scope.$on('$destroy', () => stockTakingData.clearCache());
        });

    }

    function addWithoutBarcode(articleId) {

      const article = Article.get(articleId);

      ConfirmModal.show({
        text: `Добавить без штрих-кода товар '${article.name}'?`,
      })
        .then(() => createItem(article)
          .DSCreate()
          .then(stockTakingItem => {
            vm.itemClick(stockTakingItem);
            scrollTo(stockTakingItem);
          })
          .catch(err => toastr.error(angular.toJson(err))))
        .catch(_.noop);
    }

    function setActiveTabIndex() {
      const idx = tabs.indexOf(vm.tab);
      vm.activeTabIndex = idx >= 0 ? idx : 0;
    }

    function makeStocks(stockTakingData) {

      const stockTaking = StockTaking.get(vm.stockTakingId);
      let stocks = StockTakingExport.exportData(stockTaking.items, stockTakingData.stocks);

      if (vm.search) {
        const re = new RegExp(_.escapeRegExp(vm.search), 'i');
        stocks = _.filter(stocks, ({ article: { name } }) => re.test(name));
      }

      vm.stocks = _.filter(stocks, 'diff');
      vm.stockTakingData = stockTakingData;

    }

    function createItem(article, barcode = null) {

      const { stockTakingId } = vm;
      const { id: articleId, packageRel } = article;

      return StockTakingItem.createInstance({
        stockTakingId,
        barcode,
        articleId,
        packageRel,
        volume: 1,
        timestamp: moment().utc().format('YYYY-MM-DD HH:mm:ss.SSS'),
      });

    }

    function processBarcode(code) {

      const { stockTakingId, stockTaking } = vm;

      if (!stockTaking.isValid()) {
        return toastr.info('Выберите "Склад" прежде чем начать сканирование');
      }


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

        .then(article => stockTakingId ? article : StockTaking.create(stockTaking)
          .then(() => {
            created = true;
            vm.stockTakingId = stockTaking.id;
            return article;
          }))

        .then(article => (_.get(vm.stockTakingItem, 'barcode') === code && vm.itemId)
          ? _.assign(vm.stockTakingItem, {
            volume: vm.stockTakingItem.volume + 1,
          })
          : createItem(article, code))

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
      const say = (volume === 1) ? article.firstName : Language.speakableCountFemale(volume);
      SoundSynth.say(say);
    }

    function sayInvalid() {
      SoundSynth.say(`Неправильный тип штрих-кода`);
    }

    function speakNotFound() {
      SoundSynth.say(`Неизвестный штрих-код`);
    }

    function onJSDataCollection(event) {

      DEBUG('stockTakingView onJSDataCollection', event);

      switch (event.resource) {
        // case 'StockTakingItem':
        //   return onJSDataInject(event);
        case 'WarehouseStock':
          return onStockUpdate(event);
      }

    }

    const debounceStockUpdate = _.debounce(onStockUpdate, 500);

    function onJSData(event) {

      // console.warn(event);

      switch (event.resource) {
        case 'StockTakingItem':
          return onJSDataInject(event);
        case 'WarehouseStock':
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
