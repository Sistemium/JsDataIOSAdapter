'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({

          url: '/shipment?date',
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
            templateUrl: 'app/domain/sales/shipment/ShipmentDetails.html',
            controller: 'ShipmentDetailsController as vm'
          }]

        });

    });

})();
