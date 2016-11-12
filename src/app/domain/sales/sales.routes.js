'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      var prePreOrders = {

        name: 'prePreOrders',
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

      var visit = {

        name: 'visit',
        url: '/visit?visitId',

        data: {
          // hideNavs: true
        },

        templateUrl: 'app/domain/sales/views/VisitCreate.html',
        controller: 'VisitCreateController',
        controllerAs: 'vm'

      };

      var visitCreate = {

        name: 'visitCreate',
        url: '/visitCreate?visitId',

        data: {
          disableNavs: true,
          hideTopBar: false,
          hideNavs: true
        },

        templateUrl: 'app/domain/sales/views/VisitCreate.html',
        controller: 'VisitCreateController',
        controllerAs: 'vm'

      };

      var addOutletToPartner = {

        name: 'addOutletToPartner',
        url: '/partner/:id/addOutlet',

        data: {
          hideNavs: true
        },

        templateUrl: 'app/domain/sales/views/addOutlet.html',
        controller: 'AddOutletController',
        controllerAs: 'vm'

      };

      var partner = {

        name: 'partner',
        url: '/partner/:id',

        templateUrl: 'app/domain/sales/views/partner.html',
        controller: 'PartnerController',
        controllerAs: 'vm',

        children: [addOutletToPartner]

      };

      var editPartner = {

        name: 'editPartner',
        url: '/partner/:id/edit',

        templateUrl: 'app/domain/sales/views/editPartner.html',
        controller: 'EditPartnerController',
        controllerAs: 'vm',

        data: {
          hideNavs: true
        }

      };

      var outlet = {

        name: 'outlet',
        url: '/outlet/:id',

        templateUrl: 'app/domain/sales/views/outlet.html',
        controller: 'OutletController',
        controllerAs: 'vm',

        children: [angular.copy(visit), visitCreate]

      };

      var addOutlet = {

        name: 'addOutlet',
        url: '/addOutlet',

        data: {
          hideNavs: true
        },

        templateUrl: 'app/domain/sales/views/addOutlet.html',
        controller: 'AddOutletController',
        controllerAs: 'vm'

      };

      var editOutlet = {

        name: 'editOutlet',
        url: '/outlet/:id/edit',

        templateUrl: 'app/domain/sales/views/editOutlet.html',
        controller: 'EditOutletController',
        controllerAs: 'vm',

        data: {
          hideNavs: true
        }

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

        children: [partner, editPartner, angular.copy(outlet), addOutlet, editOutlet]

      };

      var visits = {

        name: 'visits',
        url: '/visits',

        templateUrl: 'app/domain/sales/views/visits.html',
        controller: 'VisitsController',
        controllerAs: 'vm',

        data: {
          needCurrent: 'Salesman',
          needRole: 'salesman',
          title: 'Визиты'
        },

        children: [angular.copy(territory), angular.copy(outlet), angular.copy(visit)]

      };

      stateHelperProvider
        .state({

          name: 'sales',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',

          data: {
            auth: 'SalesmanAuth'
          },

          children: [angular.copy(territory), prePreOrders, visits]

        })
      ;

    })
  ;

}());
