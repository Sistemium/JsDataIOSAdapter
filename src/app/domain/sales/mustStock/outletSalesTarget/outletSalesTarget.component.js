(function () {

  angular.module('Sales').component('outletSalesTarget', {

    bindings: {
      outletId: '<',
    },

    templateUrl: 'app/domain/sales/mustStock/outletSalesTarget/outletSalesTarget.html',

    controller: outletSalesTargetController,
    controllerAs: 'vm'

  });


  function outletSalesTargetController($scope, Helpers, Schema, $q) {

    const { Shipment, ShipmentPosition, SalesTarget, SalesTargetGroup } = Schema.models();
    const { Article } = Schema.models();
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

      const where = {
        outletId: { '==': outletId },
        date: { '>=': '2019-01-01' },
      };

      return refreshTargeting()
        .then(() => Shipment.findAll({ where }, { cacheResponse: false }))
        .then(shipments => {
          const filter = { shipmentId: _.map(shipments, 'id') };
          return ShipmentPosition.groupBy(filter, ['articleId']);
        })
        .then(data => {
          vm.data = makeData(data);
        });

    }

    function makeData(shipmentPositions) {

      const byArticle = _.keyBy(shipmentPositions, 'articleId');

      const targets = SalesTarget.getAll();

      const targetsData = _.map(targets, makeTarget);

      return _.orderBy(_.map(_.groupBy(targetsData, 'targetGroup.id'), (targets, id) => ({
        id, targets, targetGroup: SalesTargetGroup.get(id),
      })), 'targetGroup.name');

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

    function refreshTargeting() {
      return $q.all([
        SalesTargetGroup.findAll(),
        SalesTarget.findAll()
          .then(data => $q.all(_.map(data, ({ articleIds }) => {
              const toLoad = _.filter(_.map(articleIds, id => Article.get(id) ? null : id));
              if (toLoad.length) {
                return Article.findAll({ id: toLoad });
              }
            }))
          ),
      ]);
    }

  }

})();
