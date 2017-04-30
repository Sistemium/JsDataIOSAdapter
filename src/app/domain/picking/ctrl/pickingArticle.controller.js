'use strict';

(function () {

  angular.module('webPage')
    .controller('PickingArticleController', function ($scope, $state) {

      let vm = this;
      const articles = $scope.vm.articles;
      let picking = _.find(articles, {id: $state.params.id});

      angular.extend(vm, {

        picking: picking,
        article: _.get(picking,'article'),
        orders: _.map($scope.$parent.vm.orders, order => {

          return {
            id: order.id,
            ndoc: order.ndoc,
            order: order,
            position: picking.position (order),
            volume: picking.orderVolume (order)
          };

        }),

        done: () => {

          picking.updatePicked ();

          $state.go ('^');
        }

      });

    });

}());
