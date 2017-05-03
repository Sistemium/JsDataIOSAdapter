'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', ArticleListController);

  function ArticleListController ($scope, $filter, $state, toastr, models, $timeout, SoundSynth, Language, $q) {

    let vm = this;
    const POP = models.PickingOrderPosition;
    //var SB = models.StockBatch;
    //var SBBC = models.StockBatchBarCode;
    const orders = $scope.vm.pickingItems || $scope.vm.selectedItems;
    const Article = models.Article;

    function processArticle(a, sb, code) {

      const pas = _.filter(vm.articles, {sameId: a.sameId});

      if (!pas.length) {
        return;
      }

      let totalUnpicked = 0;
      let pa = _.find(pas, p => {
        totalUnpicked += p.totalUnPickedVolume;
        return totalUnpicked > 0;
      });

      let pickablePositions = [];
      let maxVolume = _.result(sb,'spareVolume') || 0;

      function respondToSay(say,pickedVolume) {
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
            ? a.boxPcs(pickedVolume).full
            : say
        };
      }

      if (!pa) {
        return respondToSay();
      }

      vm.pickedIndex [pa.id] = true;

      _.each (pa.positions, pop => {

        const unp = _.min([pop.unPickedVolume(), maxVolume]);

        maxVolume -= unp;
        totalUnpicked -= unp;

        if (unp > 0) {
          pickablePositions.push ({
            pop: pop,
            unp: unp,
            num: $scope.vm.orders.indexOf(pop.PickingOrder) + 1,        // pop.PickingOrderId ???
            // TODO: check packageRels
            volume: Language.speakableBoxPcs(a.boxPcs(unp))
          });
        }

      });

      pickablePositions = _.orderBy(pickablePositions ,'num');

      if (vm.mode === 'article') {
        pickablePositions = _.take(pickablePositions);
      }

      let qs = [];

      const pickedVolume = _.reduce(pickablePositions, (res, pp) => {
        qs.push (pp.pop.linkStockBatch(sb, code, pp.unp));              // sb.id ???
        return res + pp.unp;
      }, 0);

      if (pickedVolume) {
        $q.all (qs).then(() => {
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

    let lockScanProcessor;

    $scope.$on('stockBatchBarCodeScan', (e, options) => {

      if (lockScanProcessor) {
        return;
      }

      lockScanProcessor = true;

      const fn = () => {

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

      };

      Article.find(options.stockBatch.article)                      // stockBatch.articleId ???
        .then(() => {
          $timeout(fn,10);
        })
        .catch(() => {
          lockScanProcessor = false;
        })

    });

    const positions = POP.filter({
      where: {
        pickingOrder: {                                               // pickingOrderId ???
          'in': _.map(orders, o => {
            return o.id;
          })
        }
      }
    });

    angular.extend(vm, {

      articleIndex: _.groupBy(positions, 'article'),
      orders: orders,
      pickedIndex: {},
      barCodeInput: '',
      title: ''

    });

    $scope.$on('$stateChangeSuccess', (e, to) => {

      vm.mode = to.name.match(/[^\.]*$/)[0];

      vm.title = (vm.mode === 'picked' && 'Собранные товары')
        || (vm.mode === 'articleList' && 'Товары для сборки')
      ;

      if (/^(picked|articleList)$/.test(vm.mode)){
        setGroups (vm.articles);
      }
    });

    function setGroups(articlesArray) {

      const filtered = $filter('filter')(articlesArray, vm.currentFilter);

      if (vm.mode === 'picked'){

        vm.groups = [{
          name: '',
          articles: filtered
        }];

      } else if (vm.mode === 'articleList') {

        vm.groups = _.map(
          _.groupBy(filtered, 'article.category'),
          (val, key) => {
            return {name: key, articles: val};
          }
        );

      }

    }

    vm.articles = POP.etc.pivotPositionsByArticle(vm.articleIndex);
    vm.currentFilter = $state.$current.name.match(/picked$/) ? {hasPicked: 'true'} : {isPicked: '!true'};
    vm.orderBy = $state.$current.name.match(/picked$/) ? '-ts' : 'article.name';

    setGroups (vm.articles);

  }

}());
