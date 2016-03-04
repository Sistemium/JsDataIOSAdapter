'use strict';

(function () {

  angular.module('webPage')
    .config(function ($stateProvider) {

      $stateProvider
        .state('picking', {
          abstract: true,
          template: '<div class="container"><acme-navbar></acme-navbar><div ui-view=""></div></div>'
        })
        .state('picking.pickingOrderList', {
          url: '/orders',
          templateUrl: 'app/domain/picking/pickingOrderList.html',
          controller: 'PickingOrderListController',
          controllerAs: 'vm'
        })
        .state('picking.pickingOrderList.selectedOrders', {
          url: '/selected',
          templateUrl: 'app/domain/picking/selectedOrders.html',
          controller: 'SelectedOrdersController',
          controllerAs: 'vm'
        })
        .state('picking.pickingOrderList.selectedOrders.articleList', {
          url: '/articleList',
          templateUrl: 'app/domain/picking/articleList.html',
          controller: 'ArticleListController',
          controllerAs: 'vm'
        })
      ;

    })
  ;

}());
