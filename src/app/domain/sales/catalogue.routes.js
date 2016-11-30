'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({
          url: '/catalogue',
          name: 'sales.catalogue',
          templateUrl: 'app/domain/sales/views/catalogue.html',
          controller: 'CatalogueController',
          controllerAs: 'vm',

          data: {
            title: 'Каталог'
          }

        });

    });

})();
