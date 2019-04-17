(function () {

  angular.module('Sales')
    .service('SalesTargetingService', SalesTargetingService);

  function SalesTargetingService($q, Schema, saAsync) {

    const {
      Shipment,
      ShipmentPosition,
      Article,
      ArticleGroup,
      SalesTarget,
      SalesTargetGroup
    } = Schema.models();

    const dateB = '2019-02-01';
    const dateE = '2019-04-30';

    return {
      refreshTargeting,
      shipmentsData,
      salesmanShipmentsData,
      salesmanTargetsReport,
    };

    /*
    Functions
     */

    function refreshTargeting() {
      return $q.all([
        SalesTargetGroup.findAll()
          .then(groups => {
            const toLoad = _.filter(_.map(groups, ({ articleGroupId }) =>
              ArticleGroup.get(articleGroupId) ? null : articleGroupId));
            if (toLoad.length) {
              return ArticleGroup.findAll({ id: toLoad });
            }
          }),
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

    function shipmentsData(outletId, salesmanId) {

      const where = {
        outletId: { '==': outletId },
        date: { '>=': dateB, '<=': dateE },
      };

      if (salesmanId) {
        where.salesmanId = { '==': salesmanId };
      }

      return Shipment.findAll({ where }, { cacheResponse: false })
        .then(shipments => {

          if (!shipments.length) {
            return [];
          }

          const chunks = _.chunk(_.map(shipments, 'id'), 20);

          return $q.all(_.map(chunks, shipmentId => {
            return ShipmentPosition.groupBy({ shipmentId }, ['articleId']);
          }))
            .then(arrayOfGroups => {
              return _.flatten(arrayOfGroups);
            });

        });

    }

    function salesmanShipmentsData(salesmanId) {

      const where = {
        salesmanId: { '==': salesmanId },
        date: { '>=': dateB, '<=': dateE },
      };

      return Shipment.groupBy({ where }, ['outletId'])
        .then(shipments => {

          if (!shipments.length) {
            return [];
          }

          const res = {};

          const tasks = _.map(shipments, ({ outletId }) =>
            done => shipmentsData(outletId, salesmanId)
              .then(data => {
                res[outletId] = data;
                done();
              })
              .catch(done)
          );

          return $q((resolve, reject) => {
            saAsync.series(tasks, err => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
          });

        });

    }

    function salesmanTargetsReport(positionsByOutletId) {

      const allTargets = SalesTarget.getAll();

      const targetsData = _.groupBy(allTargets.map(makeTarget), 'targetGroup.id');

      const data = _.orderBy(_.map(targetsData, (targets, id) => ({
        id, targets, targetGroup: SalesTargetGroup.get(id),
      })), ['targetGroup.articleGroup.name', 'targetGroup.name']);

      return _.map(
        _.groupBy(data, 'targetGroup.articleGroupId'),
        (targets, id) => ({
          id,
          targets,
          articleGroup: ArticleGroup.get(id),
        })
      );

      function makeTarget(target) {

        const { id, targetGroup, cnt, articleIds, name } = target;

        const outletsFulfilled = _.filter(positionsByOutletId, (positions) => {
          return target.isFulfilled(positions);
        });

        return {
          id,
          name: name || id,
          targetGroup,
          articles: Article.getAll(articleIds),
          targetCnt: cnt,
          factCnt: outletsFulfilled.length,
          // facts: _.keyBy(facts, 'articleId'),
        };

      }

    }

  }

})();
