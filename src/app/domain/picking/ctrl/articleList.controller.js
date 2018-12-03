'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', ArticleListController);

  const WAREHOUSE_BOX_SCAN_EVENT = 'warehouseBoxBarCodeScan';
  const STOCK_BATCH_SCAN_EVENT = 'stockBatchBarCodeScan';

  function ArticleListController($scope, $filter, $state, toastr, Schema,
                                 $timeout, SoundSynth, Language, $q) {

    const { Article, PickingOrderPosition: POP } = Schema.models();

    const orders = $scope.vm.pickingItems || $scope.vm.selectedItems;
    const { name: stateName } = $state.$current;

    let lockScanProcessor;

    const positions = POP.filter({
      where: {
        pickingOrderId: { 'in': _.map(orders, 'id') }
      }
    });

    const vm = angular.extend(this, {

      articleIndex: _.groupBy(positions, 'articleId'),
      orders: orders,
      pickedIndex: {},
      barCodeInput: '',
      title: ''

    });

    vm.articles = POP.etc.pivotPositionsByArticle(vm.articleIndex);
    vm.currentFilter = stateName.match(/picked$/) ? { hasPicked: 'true' } : { isPicked: '!true' };
    vm.orderBy = stateName.match(/picked$/) ? '-ts' : 'article.name';

    $scope.$on('$stateChangeSuccess', onStateChange);

    $scope.$on(STOCK_BATCH_SCAN_EVENT, onStockBatchScan);
    $scope.$on(WAREHOUSE_BOX_SCAN_EVENT, onWarehouseBoxScan);

    setGroups(vm.articles);

    /*
    Functions
     */

    function onWarehouseBoxScan(e, options) {
      console.info(options);
    }

    function onStockBatchScan(e, options) {

      if (lockScanProcessor) {
        return;
      }

      lockScanProcessor = true;

      Article.find(options.stockBatch.articleId)
        .then(() => {
          $timeout(processorFn, 10);
        })
        .catch(() => {
          lockScanProcessor = false;
        });

      function processorFn() {

        const found = options.stockBatch.Article &&
          processArticle(options.stockBatch.Article, options.stockBatch, options.code);

        if (found && found.id) {
          toastr.success(found.name, found.volume);
          if (found.speakable) {
            SoundSynth.say(found.speakable);
          }
        } else {
          SoundSynth.say('Этого товара нет в требовании');
        }

        lockScanProcessor = false;

      }

    }

    function onStateChange(e, to) {

      vm.mode = to.name.match(/[^.]*$/)[0];

      vm.title = (vm.mode === 'picked' && 'Собранные товары')
        || (vm.mode === 'articleList' && 'Товары для сборки');

      if (/^(picked|articleList)$/.test(vm.mode)) {
        setGroups(vm.articles);
      }

    }

    function setGroups(articlesArray) {

      const filtered = $filter('filter')(articlesArray, vm.currentFilter);

      if (vm.mode === 'picked') {

        vm.groups = [];

        if (filtered.length) {
          vm.groups.push({
            name: '',
            articles: filtered
          });
        }

      } else if (vm.mode === 'articleList') {

        vm.groups = _.map(
          _.groupBy(filtered, 'article.category'),
          (val, key) => {
            return { name: key, articles: val };
          }
        );

      }

    }

    function processArticle(a, sb, code) {

      const pas = _.filter(vm.articles, { sameId: a.sameId });

      if (!pas.length) {
        return;
      }

      let totalUnpicked = 0;
      let pa = _.find(pas, p => {
        totalUnpicked += p.totalUnPickedVolume;
        return totalUnpicked > 0;
      });

      let pickablePositions = [];
      let maxVolume = _.result(sb, 'spareVolume') || 0;

      function respondToSay(say, pickedVolume) {
        if (!say && !totalUnpicked) {
          say = 'Товар уже собран';
        } else if (!say) {
          say = 'В этой партии уже нет товара';
        }

        if (totalUnpicked) {
          say += '.  Требуется товар из другой партии';
        }

        return {
          id: a.id,
          name: a.name,
          speakable: _.trim(say),
          volume: pickedVolume
            ? a.boxPcs(pickedVolume, true).full
            : say
        };
      }

      if (!pa) {
        return respondToSay();
      }

      vm.pickedIndex [pa.id] = true;

      _.each(pa.positions, pop => {

        const unp = _.min([pop.unPickedVolume(), maxVolume]);

        maxVolume -= unp;
        totalUnpicked -= unp;

        if (unp > 0) {
          pickablePositions.push({
            pop: pop,
            unp: unp,
            num: $scope.vm.orders.indexOf(pop.PickingOrder) + 1,
            // TODO: check packageRels
            volume: Language.speakableBoxPcs(a.boxPcs(unp, true))
          });
        }

      });

      pickablePositions = _.orderBy(pickablePositions, 'num');

      if (vm.mode === 'article') {
        pickablePositions = _.take(pickablePositions);
      }

      let qs = [];

      const pickedVolume = _.reduce(pickablePositions, (res, pp) => {
        qs.push(pp.pop.linkStockBatch(sb, code, pp.unp));
        return res + pp.unp;
      }, 0);

      if (pickedVolume) {
        $q.all(qs).then(() => {
          pa.updatePicked();
          setGroups(vm.articles);
        })
      }

      const say = _.reduce(pickablePositions, (res, pp, idx) => {
        return res
          + (idx ? ', плюс ' : '')
          + pp.volume
          + ($scope.vm.orders.length > 1
              ? (pp.num === 2 ? ' во ' : ' в ')
              + Language.orderRu(pp.num)
              : ''
          );
      }, '');

      return respondToSay(say, pickedVolume);

    }


  }

})();
