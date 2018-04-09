'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          url: '/shipment',
          name: 'sales.shipmentList',
          templateUrl: 'app/domain/sales/shipment/ShipmentList.html',
          controller: 'ShipmentListController as vm',

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
