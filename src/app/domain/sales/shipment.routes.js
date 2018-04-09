'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          url: '/shipment',
          name: 'sales.shipmentList',
          template: '<shipment-list></shipment-list>',

          data: {
            title: 'Отгрузки',
            rootState: 'sales.shipmentList'
          },

          children: [{
            url: '/:id',
            name: 'item',
            template: '<shipment-details shipment-id="vm.params.id"></shipment-details>',
            controller: 'StateController as vm'
          }]

        });

    });

})();
