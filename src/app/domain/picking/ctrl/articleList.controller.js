'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', function ($scope, $uiViewScroll, $state, toastr, models, SoundSynth, Language) {

        var vm = this;
        var POP = models.PickingOrderPosition;
        //var SB = models.StockBatch;
        //var SBBC = models.StockBatchBarCode;
        var orders = $scope.vm.selectedItems;
        vm.scroll = $uiViewScroll;

        function processArticle(a, sb, code) {

          if (!vm.articleIndex [a.id]) {
            return;
          }

          var pa = _.find(vm.articles, {id: a.id});

          pa.isPicked = true;
          vm.pickedIndex [a.id] = true;

          var pickedVolume = _.reduce(pa.positions, function (res,pop) {
            var unp = pop.unPickedVolume();
            if (unp) {
              pop.linkStockBatch(sb, code, unp);
            }
            return res + unp;
          },0);

          return {
            id: a.id,
            name: a.name,
            volume: pickedVolume ?
              Language.speakableBoxPcs (a.boxPcs(pickedVolume))
              //$filter('bottles')(pickedVolume)
              : 'Товар уже собран'
          };

        }

        $scope.$on ('stockBatchBarCodeScan',function (e,options) {

          var found = processArticle(options.stockBatch.Article, options.stockBatch, options.code);

          if (found && found.id) {
            toastr.success (found.name, found.volume);
            //$uiViewScroll (angular.element (document.getElementById(found.id)));
          } else {
            SoundSynth.say ('Этого товара нет в требовании');
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
          orders: $scope.vm.selectedItems,
          sbbcs: [],
          pickedIndex: {},

          barCodeInput: '',

          title: ''

        });

        $scope.$on('$stateChangeSuccess', function (e, to) {
          vm.title = to.name.match(/picked$/) && 'Собранные товары'
            || to.name.match(/articleList$/) && 'Товары для сборки';
        });

        vm.articles = POP.etc.pivotPositionsByArticle (vm.articleIndex);
        vm.currentFilter = $state.$current.name.match(/picked$/) ? {isPicked: 'true'} : {isPicked: '!true'};
        vm.orderBy = $state.$current.name.match(/picked$/) ? '-ts' : 'article.name';

      }
    );

}());
