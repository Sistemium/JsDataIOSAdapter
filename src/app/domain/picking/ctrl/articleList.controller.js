'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', function ($scope, $uiViewScroll, toastr, models, Errors, BarCodeScanner) {

      var vm = this;
      var POP = models.PickingOrderPosition;
      var SB = models.StockBatch;
      var SBBC = models.StockBatchBarCode;
      var orders = $scope.vm.selectedItems;
      vm.scroll = $uiViewScroll;

      function showToastr (msg,title) {
        toastr.success (msg,title);
      }

      function processArticle (a) {

        if (!vm.articleIndex [a.id]) {
          return;
        }

        var pa = _.find(vm.articles,{id: a.id});

        pa.isPicked = true;
        vm.pickedIndex [a.id] = true;

        return {
          id: a.id,
          name: a.name,
          volume: pa.volume.full,
          message: a.name + ': ' + pa.volume.full
        };

      }

      function scanFn (code) {

        Errors.clear();

        return SB.someBy.barCode (code || vm.barCodeInput).then (function (sbs) {

          var found = 'Неизвестный штрих-код';

          _.each (sbs, function (sb){
            found = processArticle (sb.Article);
            return !found;
          });

          if (found && found.id && !found.isPicked){
            showToastr (found.name, found.volume);
            //$uiViewScroll (angular.element (document.getElementById(found.id)));
          } else {
            Errors.ru.add (found || 'Этого товара нет в требовании');
          }


        }).catch (Errors.ru.add);

      }

      BarCodeScanner.bind (scanFn);

      var positions = POP.filter ({
        where: {
          pickingOrder: {
            'in': _.map(orders,function (o) {
              return o.id;
            })
          }
        }
      });

      angular.extend (vm, {

        articleIndex: _.groupBy(positions, 'article'),
        orders: $scope.vm.selectedItems,
        sbbcs: [],
        pickedIndex: {},

        barCodeInput: '',

        onBarCode: scanFn

      });

      vm.articles = _.orderBy (_.map (vm.articleIndex, function (val, key) {

        var totalVolume = _.reduce (val,function (sum,pos) {
          return sum + pos.volume;
        },0);

        var article = val[0].Article;
        var boxPcs = article && article.boxPcs (totalVolume);

        SBBC.someBy.article (article.id).then (function (sbbcs){
          vm.sbbcs.push ({
            id: article.id,
            sbbcs: sbbcs
          });
        });

        return {

          id: key,
          article: val[0].Article,
          positions: val,
          volume: boxPcs,

          orderVolume: function (order) {
            var p = _.find (val, ['pickingOrder', order.id]);
            return article.boxPcs (p && p.volume || 0);
          }

        }

      }),'article.name');

    })
  ;

}());
