'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider
        .state({
          name: 'picking',
          abstract: true,
          template: '<div class="container"><acme-navbar></acme-navbar><div ui-view=""></div></div>',
          children: [
            { name:'pickingOrderList',
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
