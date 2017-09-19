'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      const prePreOrders = {

        name: 'prePreOrders',
        url: '/prePreOrders?state',

        templateUrl: 'app/domain/sales/views/prePreOrderList.html',
        controller: 'PrePreOrderListController',
        controllerAs: 'vm',

        data: {
          needRoles: 'preOrdering'
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

      const visit = {

        name: 'visit',
        url: '/visit?visitId',

        data: {
          // hideNavs: true
        },

        templateUrl: 'app/domain/sales/views/VisitCreate.html',
        controller: 'VisitCreateController',
        controllerAs: 'vm'

      };

      const visitCreate = {

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

      const addOutletToPartner = {

        name: 'addOutletToPartner',
        url: '/partner/:id/addOutlet',

        data: {
          hideNavs: true
        },

        templateUrl: 'app/domain/sales/territory/outlet/addOutlet.html',
        controller: 'AddOutletController',
        controllerAs: 'vm'

      };

      const partner = {

        name: 'partner',
        url: '/partner/:id',

        templateUrl: 'app/domain/sales/views/partner.html',
        controller: 'PartnerController',
        controllerAs: 'vm',

        children: [addOutletToPartner]

      };

      const editPartner = {

        name: 'editPartner',
        url: '/partner/:id/edit',

        templateUrl: 'app/domain/sales/views/editPartner.html',
        controller: 'EditPartnerController',
        controllerAs: 'vm',

        data: {
          hideNavs: true
        }

      };

      const outlet = {

        name: 'outlet',
        url: '/outlet/:id?showLocation',

        templateUrl: 'app/domain/sales/territory/outlet/outlet.html',
        controller: 'OutletController',
        controllerAs: 'vm',

        children: [angular.copy(visit), visitCreate],

        data: {
          rootState: 'sales.territory'
        }

      };

      const addOutlet = {

        name: 'addOutlet',
        url: '/addOutlet',

        data: {
          hideNavs: true
        },

        templateUrl: 'app/domain/sales/territory/outlet/addOutlet.html',
        controller: 'AddOutletController',
        controllerAs: 'vm'

      };

      const editOutlet = {

        name: 'editOutlet',
        url: '/outlet/:id/edit',

        templateUrl: 'app/domain/sales/territory/outlet/editOutlet.html',
        controller: 'EditOutletController',
        controllerAs: 'vm',

        data: {
          hideNavs: true
        }

      };

      const territory = {

        name: 'territory',
        url: '/territory',

        templateUrl: 'app/domain/sales/territory/territory.html',
        controller: 'SalesTerritoryController',
        controllerAs: 'vm'

      };

      const salesTerritory = _.assign({

        data: {
          title: 'Клиенты'
        },

        children: [partner, editPartner, _.cloneDeep(outlet), addOutlet, editOutlet]

      }, territory);

      const visits = {

        name: 'visits',
        url: '/visits?date',

        templateUrl: 'app/domain/sales/views/visits.html',
        controller: 'VisitsController',
        controllerAs: 'vm',

        data: {
          title: 'Визиты'
        },

        children: [territory, _.cloneDeep(outlet), _.cloneDeep(visit), _.cloneDeep(visitCreate)]

      };

      stateHelperProvider
        .state({

          name: 'sales',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',

          data: {
            auth: 'SalesmanAuth'
          },

          children: [salesTerritory, prePreOrders, visits]

        })
      ;

    })
  ;

})();
