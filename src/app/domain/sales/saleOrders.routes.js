'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({
          url: '/saleOrders?date',
          name: 'sales.saleOrders',
          templateUrl: 'app/domain/sales/views/saleOrders.html',
          controller: 'SaleOrderController',
          controllerAs: 'vm',

          data: {
            title: 'Заказы'
          }

        });

    });

})();
