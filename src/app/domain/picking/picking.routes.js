'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      var articleChildren = [
        {
          name: 'article',
          url: '/:id',
          templateUrl: 'app/domain/picking/pickingArticle.html',
          controller: 'PickingArticleController',
          controllerAs: 'vm',
          data: {
            hideBottomBar: true
          },
          children: [
            {
              name: 'pick',
              url: '/pick/:positionId',
              templateUrl: 'app/domain/picking/pickPosition.html',
              controller: 'PickedPositionController',
              controllerAs: 'vm',
              data: {
                hideTopBar: true
              }
            },{
              name: 'pickedPosition',
              url: '/picked/:pickedPositionId',
              templateUrl: 'app/domain/picking/pickPosition.html',
              controller: 'PickedPositionController',
              controllerAs: 'vm',
              data: {
                hideTopBar: true
              }
            }
          ]
        }
      ];

      stateHelperProvider

        .state({
          name: 'picking',
          abstract: true,
          templateUrl: 'app/domain/ui-view.html',
          data: {
            auth: true
          },
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
                  children: angular.copy (articleChildren)
                },{
                  name: 'picked',
                  url: '/picked',
                  templateUrl: 'app/domain/picking/articleList.html',
                  controller: 'ArticleListController',
                  controllerAs: 'vm',
                  children: angular.copy (articleChildren)
                }
              ]
            }
          ]
        })
      ;

    })
  ;

}());
