'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({
          url: '/saleOrders',
          name: 'sales.saleOrders',
          template: '<h3>SaleOrders</h3>'
        });

    });

})();
