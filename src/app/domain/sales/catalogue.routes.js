'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({
          url: '/catalogue?articleGroupId&q',
          name: 'sales.catalogue',
          templateUrl: 'app/domain/sales/views/catalogue.html',
          controller: 'CatalogueController',
          controllerAs: 'vm',

          data: {
            title: 'Каталог'
          },

          children: [
            {
              name: 'saleOrder',
              url: '/saleOrder?saleOrderId',
              templateUrl: 'app/domain/sales/views/catalogue/catalogueSaleOrder.html',
              controller: 'CatalogueSaleOrderController',
              controllerAs: 'vm'
            }
          ]

        });

    });

})();
