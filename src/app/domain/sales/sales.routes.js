'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      var prePreOrders = {
        name:'prePreOrders',
        url: '/prePreOrders?state',

        templateUrl: 'app/domain/sales/views/prePreOrderList.html',
        controller: 'PrePreOrderListController',
        controllerAs: 'vm',

        data: {
          needCurrent: 'Salesman',
          needRole: 'preOrdering'
        },

        children: [
          {
            name: 'selectedOrder',
            url: '/selected',
            templateUrl: 'app/domain/views/selectedPrePreOrder.html',
            controller: 'SelectedPrePreOrderController',
            controllerAs: 'vm'
          }
        ]
      };
      
      stateHelperProvider
        .state({

          name: 'sales',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',
          
          children: [prePreOrders]
          
        })
      ;

    })
  ;

}());
