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

      vm.articles = [];

      vm.articleIndex = _.groupBy(positions, 'article');

      vm.articles = _.map (vm.articleIndex, function (val, key) {
        return {
          id: key,
          article: val[0].Article,
          positions: val
        }
      })

    })
  ;

}());
