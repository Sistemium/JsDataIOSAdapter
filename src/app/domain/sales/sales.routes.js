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

      var territory = {
        name: 'territory',
        url: '/territory',

        templateUrl: 'app/domain/sales/views/territory.html',
        controller: 'SalesTerritoryController',
        controllerAs: 'vm',

        data: {
          needCurrent: 'Salesman',
          needRole: 'salesman',
          // hideTopBar: true,
          title: 'Клиенты'
        },

        children: [
          {
            name: 'outlet',
            url: '/outlet/:id',
            templateUrl: 'app/domain/sales/views/outlet.html',
            controller: 'OutletController',
            controllerAs: 'vm',

            children: [{
              name: 'visit',
              url: '/visit?visitId',

              data: {
                hideNavs: true
              },

              templateUrl: 'app/domain/sales/views/VisitCreate.html',
              controller: 'VisitCreateController',
              controllerAs: 'vm'

            },{
              name: 'visitCreate',
              url: '/visitCreate?visitId',

              data: {
                hideNavs: true
              },

              templateUrl: 'app/domain/sales/views/VisitCreate.html',
              controller: 'VisitCreateController',
              controllerAs: 'vm'

            }]
          }
        ]

      };

      stateHelperProvider
        .state({

          name: 'sales',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',

          data: {
            auth: 'SalesmanAuth'
          },

          children: [territory,prePreOrders]

        })
      ;

    })
  ;

}());
