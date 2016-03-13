'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider

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
                  controllerAs: 'vm'
                },{
                  name: 'articleList',
                  url: '/articleList',
                  templateUrl: 'app/domain/picking/articleList.html',
                  controller: 'ArticleListController',
                  controllerAs: 'vm',
                  children: [
                    {
                      name: 'article',
                      url: '/:id',
                      templateUrl: 'app/domain/picking/pickingArticle.html',
                      controller: 'PickingArticleController',
                      controllerAs: 'vm',
                      children: [
                        {
                          name: 'pick',
                          url: '/:positionId',
                          templateUrl: 'app/domain/picking/pickPosition.html',
                          controller: 'PickPositionController',
                          controllerAs: 'vm'
                        }
                      ]
                    }
                  ]
                },{
                  name: 'picked',
                  url: '/picked',
                  templateUrl: 'app/domain/picking/articleList.html',
                  controller: 'ArticleListController',
                  controllerAs: 'vm'
                }
              ]
            }
          ]
        })
      ;

    })
  ;

}());
