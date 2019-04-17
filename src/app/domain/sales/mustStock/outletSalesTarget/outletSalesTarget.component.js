(function () {

  angular.module('Sales').component('outletSalesTarget', {

    bindings: {
      outletId: '<',
    },

    templateUrl: 'app/domain/sales/mustStock/outletSalesTarget/outletSalesTarget.html',

    controller: outletSalesTargetController,
    controllerAs: 'vm'

  });


  function outletSalesTargetController($scope, Helpers, Schema, SalesTargetingService) {

    const { SalesTarget, SalesTargetGroup } = Schema.models();
    const { Article, ArticleGroup } = Schema.models();
    const { saControllerHelper } = Helpers;

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({
      $onInit,
    });

    function $onInit() {
      vm.setBusy(refresh());
    }

    function refresh() {

      const { outletId } = vm;

      return SalesTargetingService.refreshTargeting()
        .then(() => SalesTargetingService.shipmentsData(outletId))
        .then(data => {
          vm.data = _.map(
            _.groupBy(makeData(data), 'targetGroup.articleGroupId'),
            (targets, id) => ({
              id,
              targets,
              articleGroup: ArticleGroup.get(id),
            }));
        });

    }

    function makeData(shipmentPositions) {

      const byArticle = _.keyBy(shipmentPositions, 'articleId');

      const targets = SalesTarget.getAll();

      const targetsData = _.groupBy(targets.map(makeTarget), 'targetGroup.id');

      return _.orderBy(_.map(targetsData, (targets, id) => ({
        id, targets, targetGroup: SalesTargetGroup.get(id),
      })), ['targetGroup.articleGroup.name', 'targetGroup.name']);

      function makeTarget({ id, targetGroup, articleIds, cnt }) {

        const facts = _.filter(_.map(articleIds, articleId => {
          const fact = byArticle[articleId];
          return fact && { articleId, fact };
        }));

        return {
          id,
          targetGroup,
          articles: Article.getAll(articleIds),
          targetCnt: cnt,
          factCnt: Object.keys(facts).length,
          facts: _.keyBy(facts, 'articleId'),
        };

      }

    }


  }

})();
