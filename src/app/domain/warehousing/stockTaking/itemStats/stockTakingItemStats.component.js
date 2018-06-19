(function () {

  angular.module('Warehousing')
    .component('stockTakingItemStats', {

      bindings: {
        filter: '<',
        activeId: '=',
        onItemClick: '&',
        scroll: '=',
      },

      controller: StockTakingItemStatsController,
      templateUrl: 'app/domain/warehousing/stockTaking/itemStats/stockTakingItemStats.html',
      controllerAs: 'vm',

    });


  function StockTakingItemStatsController($scope, saControllerHelper, $anchorScroll, $timeout,
                                          Schema) {

    const { StockTakingItem, Article } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit() {
        vm.rebindAll(StockTakingItem, vm.filter, 'vm.stockTakingItems', setStatsData);
        vm.watchScope('vm.activeId', setExpanded);
      },

      itemClick($item) {
        vm.onItemClick({ $item });
      },

      scroll(item) {
        $timeout(250).then(() => {
          $anchorScroll(vm.statAnchorId(item.articleId));
        });
      },

      statAnchorId(id) {
        return `id-${_.replace(id, /[^a-zа-я0-9]/ig, '-')}`;
      }

    });

    function setExpanded() {
      const { activeId, expandItemId } = vm;
      vm.expandItemId = activeId && _.get(StockTakingItem.get(activeId), 'articleId') || expandItemId;
    }

    function setStatsData() {

      let data = _.groupBy(vm.stockTakingItems, 'articleId');

      data = _.map(data, (items, articleId) => {

        const res = {
          id: articleId,
          article: Article.get(articleId),
          items,
          volume: _.sumBy(items, 'volume'),
          packageRel: _.get(_.maxBy(items, 'packageRel'), 'packageRel'),
        };

        if (!res.article) {
          Article.find(articleId)
            .then(article => res.article = article);
        }

        return res;

      });

      vm.data = _.orderBy(data, 'article.name');

      setExpanded();

    }

  }

})();
