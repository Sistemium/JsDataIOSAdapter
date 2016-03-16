'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', function ($scope, $uiViewScroll, $state, toastr, models, Errors) {

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

          _.each(pa.positions, function (pop) {
            pop.linkStockBatch(sb, code);
          });

          return {
            id: a.id,
            name: a.name,
            volume: pa.volume.full,
            message: a.name + ': ' + pa.volume.full
          };

        }

        $scope.$on ('stockBatchBarCodeScan',function (e,options) {

          var found = processArticle(options.stockBatch.Article, options.stockBatch, options.code);

          if (found && found.id && !found.isPicked) {
            toastr.success (found.name, found.volume);
            //$uiViewScroll (angular.element (document.getElementById(found.id)));
          } else {
            Errors.ru.add ('Этого товара нет в требовании');
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
