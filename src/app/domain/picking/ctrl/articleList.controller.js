'use strict';

(function () {

  angular.module('webPage')
    .controller('ArticleListController', function ($scope, models) {

      var vm = this;
      var POP = models.PickingOrderPosition;
      var orders = $scope.vm.selectedItems;

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
        orders: $scope.vm.selectedItems
      });

      vm.articles = _.orderBy (_.map (vm.articleIndex, function (val, key) {

        var totalVolume = _.reduce (val,function (sum,pos) {
          return sum + pos.volume;
        },0);

        var article = val[0].Article;
        var boxPcs = article && article.boxPcs (totalVolume);

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
