'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', ArticleListController);

  function ArticleListController ($scope, $filter, $state, toastr, models, SoundSynth, Language) {

    var vm = this;
    var POP = models.PickingOrderPosition;
    //var SB = models.StockBatch;
    //var SBBC = models.StockBatchBarCode;
    var orders = $scope.vm.pickingItems || $scope.vm.selectedItems;

    function processArticle(a, sb, code) {

      if (!vm.articleIndex [a.id]) {
        return;
      }

      var pa = _.find(vm.articles, {id: a.id});

      vm.pickedIndex [a.id] = true;

      var pickablePositions = [];

      _.each (pa.positions,function (pop){
        var unp = pop.unPickedVolume();
        if (unp > 0) {
          pickablePositions.push ({
            pop: pop,
            unp: unp,
            num: $scope.vm.orders.indexOf(pop.PickingOrder) + 1,
            volume: Language.speakableBoxPcs(a.boxPcs(unp))
          });
        }
      });

      pickablePositions = _.orderBy(pickablePositions ,'num');

      var pickedVolume = _.reduce(pickablePositions, function (res, pp) {
        pp.pop.linkStockBatch(sb, code, pp.unp).then(function () {
          pa.updatePicked();
        });
        return res + pp.unp;
      }, 0);

      if (pickedVolume) {
        setGroups(vm.articles);
      }

      var say = _.reduce(pickablePositions, function (res, pp, idx) {
        return res
          + (idx ? ' и ' : '')
          + pp.volume
          + ($scope.vm.orders.length > 1
              ? (pp.num === 2 ? ' во ' : ' в ')
            + Language.orderRu(pp.num)
              : ''
          );
      }, '');

      if (!say) {
        say = 'Товар уже собран';
      }

      return {
        id: a.id,
        name: a.name,
        speakable: _.trim(say),
        volume: pickedVolume
          ? a.boxPcs(pickedVolume).full
          : 'Товар уже собран'
      };

    }

    $scope.$on('stockBatchBarCodeScan', function (e, options) {

      var found = options.stockBatch.Article && processArticle(options.stockBatch.Article, options.stockBatch, options.code);

      if (found && found.id) {
        toastr.success(found.name, found.volume);
        if (found.speakable) {
          SoundSynth.say(found.speakable);
        }
      } else {
        SoundSynth.say('Этого товара нет в требовании');
      }

    });

    var positions = POP.filter({
      where: {
        pickingOrder: {
          'in': _.map(orders, function (o) {
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

    $scope.$on('$stateChangeSuccess', function (e, to) {

      vm.mode = to.name.match(/[^\.]*$/)[0];

      vm.title = (vm.mode === 'picked' && 'Собранные товары')
        || (vm.mode === 'articleList' && 'Товары для сборки')
      ;

      if (/^(picked|articleList)$/.test(vm.mode)){
        setGroups (vm.articles);
      }
    });

    function setGroups(articlesArray) {

      var filtered = $filter('filter')(articlesArray, vm.currentFilter);

      vm.groups = (vm.mode === 'picked') ? [{
        name: '',
        articles: filtered
      }] : _.map(
        _.groupBy(filtered, 'article.category'),
        function (val, key) {
          return {name: key, articles: val};
        }
      );

    }

    vm.articles = POP.etc.pivotPositionsByArticle(vm.articleIndex);
    vm.currentFilter = $state.$current.name.match(/picked$/) ? {hasPicked: 'true'} : {isPicked: '!true'};
    vm.orderBy = $state.$current.name.match(/picked$/) ? '-ts' : 'article.name';

    setGroups (vm.articles);
//    $scope.$watch('vm.articles', setGroups);

  }

}());
