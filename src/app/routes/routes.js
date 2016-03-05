'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider

        .state({
          name: 'playground',
          url: '/playground',
          templateUrl: 'app/domain/playground/playground.html',
          controller: 'PlayGroundController',
          controllerAs: 'vm'
        })

        .state({
          name: 'picking',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',
          children: [
            { name:'orderList',
              url: '/orders',
              templateUrl: 'app/domain/picking/pickingOrderList.html',
              controller: 'PickingOrderListController',
              controllerAs: 'vm',
              children: [
                {
                  name: 'selectedOrders',
                  url: '/selected',
                  templateUrl: 'app/domain/picking/selectedOrders.html',
                  controller: 'SelectedOrdersController',
                  controllerAs: 'vm',
                  children: [
                    {
                      name: 'articleList',
                      url: '/articleList',
                      templateUrl: 'app/domain/picking/articleList.html',
                      controller: 'ArticleListController',
                      controllerAs: 'vm'
                    }
                  ]
                }
              ]
            }
          ]
        })
      ;

    })
  ;

}());
