'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({
          url: '/saleOrders',
          name: 'sales.saleOrders',
          templateUrl: 'app/domain/sales/saleOrder/saleOrders.html',
          controller: 'SaleOrderInfiniteScrollController',
          controllerAs: 'vm',

          data: {
            title: 'Заказы',
            rootState: 'sales.saleOrders'
          },

          children: [{
            url: '/:id',
            name: 'item',
            templateUrl: 'app/domain/sales/saleOrder/saleOrderDetails.html',
            controller: 'SaleOrderDetailsController',
            controllerAs: 'vm'
          }]

        })

    });

})();
