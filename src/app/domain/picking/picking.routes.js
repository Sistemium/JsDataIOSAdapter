'use strict';

(function () {

  angular.module('webPage')
    .config(function (stateHelperProvider) {

      stateHelperProvider.state({
        name: 'picker',
        url: '/picker',
        templateUrl: 'app/domain/picker/info.html',
        controller: 'PickerInfoController',
        controllerAs: 'vm'
      });

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
              controllerAs: 'vm'
            },{
              name: 'pickedPosition',
              url: '/picked/:pickedPositionId',
              templateUrl: 'app/domain/picking/pickPosition.html',
              controller: 'PickedPositionController',
              controllerAs: 'vm'
            }
          ]
        }
      ];

      stateHelperProvider

        .state({
          name: 'picking',
          abstract: true,
          template: '<div class="domain-ui-view picking" ui-view></div>',
          data: {
            auth: 'pickerAuth'
          },
          children: [
            { name:'orderList',
              url: '/orders?state',
              templateUrl: 'app/domain/picking/pickingOrderList.html',
              controller: 'PickingOrderListController',
              controllerAs: 'vm',
              data: {
                title: 'Сборка требований'
              },
              children: [
                {
                  name: 'selectedOrders',
                  url: '/selected',
                  templateUrl: 'app/domain/picking/selectedOrders.html',
                  controller: 'SelectedOrdersController',
                  controllerAs: 'vm',
                  data: {
                    hideTopBar: true
                  }
                },{
                  name: 'articleList',
                  url: '/articleList',
                  templateUrl: 'app/domain/picking/articleList.html',
                  controller: 'ArticleListController',
                  controllerAs: 'vm',
                  children: angular.copy (articleChildren),
                  data: {
                    needBarcode: true,
                    hideTopBar: true
                  }
                },{
                  name: 'picked',
                  url: '/picked',
                  templateUrl: 'app/domain/picking/articleList.html',
                  controller: 'ArticleListController',
                  controllerAs: 'vm',
                  children: angular.copy (articleChildren),
                  data: {
                    needBarcode: true,
                    hideTopBar: true
                  }
                }
              ]
            }
          ]
        })
      ;

    })
  ;

})();
