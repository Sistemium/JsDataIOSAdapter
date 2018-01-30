'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          url: '/catalogue/{articleGroupId}?q',
          name: 'sales.catalogue',
          templateUrl: 'app/domain/sales/catalogue/catalogue.html',
          controller: 'CatalogueController',
          controllerAs: 'vm',

          data: {
            title: 'Каталог',
            auth: 'SalesmanAuth',
            rootState: 'sales.catalogue'
          },

          children: [
            {
              name: 'saleOrder',
              url: '/saleOrder/{saleOrderId}?ordered&outletId&salesmanId',
              templateUrl: 'app/domain/sales/catalogue/catalogueSaleOrder.html',
              controller: 'CatalogueSaleOrderController',
              controllerAs: 'vm'
            }
          ]

        });

    });

})();
