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
      SalesTargetGroup,
      Outlet,
      Quarter,
    } = Schema.models();

    return {
      refreshTargeting,
      shipmentsData,
      salesmanShipmentsData,
      salesmanTargetsReport,
      targetingArticleGroups,
      salesmanArticleGroupReport,
      targetsByArticleGroup,
      datePeriods,
      defaultPeriod,
    };

    /*
    Functions
     */

    function datePeriods() {
      return Quarter.getAll();
    }

    function defaultPeriod() {
      return Quarter.meta.getCurrent();
    }

    function targetsByArticleGroup(articleGroupId) {
      return SalesTargetGroup.filter({ articleGroupId });
    }

    function targetingArticleGroups() {
      const ids = _.map(SalesTargetGroup.getAll(), 'articleGroupId');
      return ArticleGroup.getAll(_.uniq(ids));
    }

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

    function shipmentsData(outletId, salesmanId, dateB, dateE) {

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
            .then(arrayOfGroups => _.flatten(arrayOfGroups));

        });

    }

    function salesmanShipmentsData(salesmanId, dateB, dateE) {

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
            done => shipmentsData(outletId, salesmanId, dateB, dateE)
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


    function salesmanArticleGroupReport(positionsByOutletId) {

      const allGroups = SalesTargetGroup.getAll();

      return _.mapValues(_.groupBy(allGroups, 'articleGroupId'), groups => {

        const targets = _.flatten(_.map(groups, group => group.targets));

        const byOutletId = _.mapValues(positionsByOutletId, (outletPositions, outletId) => {
          return outletTargets(targets, outletId, outletPositions);
        });

        const res = _.map(byOutletId, (targets, outletId) => ({
          outletId,
          outlet: Outlet.get(outletId),
          targets,
        }));

        return _.orderBy(res, ['outlet.name', 'outlet.address']);

      });

      function outletTargets(targets, outletId, positions) {

        const map = _.filter(_.map(targets, target => {

          const matches = target.matches(positions);

          return matches && {
            id: target.id,
            matches,
          };

        }));

        return map.length && _.mapValues(_.keyBy(map, 'id'), ({ matches }) => matches);

      }

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
