(function (module) {

  const NO_CACHE = { bypassCache: true };

  function SalesService(Schema, $q, moment) {

    const { Outlet, Partner, Location, OutletStats } = Schema.models();
    const { PossibleOutlet, PossibleOutletPhoto, CampaignGroup } = Schema.models();

    return {

      loadCampaignGroups(vm) {

        function defaultGroup(campaignGroups, today) {
          return _.find(campaignGroups, group => group.dateB <= today && today <= group.dateE);
        }

        return CampaignGroup.findAll(CampaignGroup.meta.filterActual())
          .then(campaignGroups => {

            vm.campaignGroups = _.orderBy(campaignGroups, ['dateB'], ['desc']);

            if (!vm.campaignGroupId) {
              vm.campaignGroupId = _.get(defaultGroup(vm.campaignGroups, moment().format()), 'id');
            }

          });

      },

      findOutletStats(salesman, dateB, dateE) {

        const { id: salesmanId } = salesman || {};

        if (!salesmanId) {
          return $q.resolve([]);
        }

        const filter = {
          salesmanId,
          dateB,
          dateE,
        };

        return this.findAllSalesmanOutlets(salesmanId)
          .then(() => OutletStats.findAll(filter, { bypassCache: true }))
          .then(res => _.orderBy(res, ({ outlet }) => outlet.name));

      },


      findAllSalesmanOutlets(salesmanId) {

        let filter = Outlet.meta.salesmanFilter({ salesmanId });

        return Outlet.findAll(filter)
          .then(outlets => {
            const toLoad = _.filter(outlets, ({ partner }) => !partner);
            return Partner.findByMany(_.map(toLoad, 'partnerId'), { chunk: 20 })
              .then(() => outlets);
          });

      },

      findAllPossibleOutlets({ id: salesmanId }) {
        return PossibleOutlet.findAll({ salesmanId }, NO_CACHE)
          .then(outlets => {

            const options = _.assign({ field: 'possibleOutletId' }, NO_CACHE);
            const ids = _.map(outlets, 'id');
            const locationIds = _.map(outlets, 'locationId');

            return $q.all([
              PossibleOutletPhoto.findByMany(ids, options),
              Location.findByMany(locationIds, NO_CACHE),
            ]).then(() => _.orderBy(outlets, ['name', 'address']));

          });
      },

      bindPossibleOutlet(scope, possibleOutletId) {
        PossibleOutlet.bindOne(possibleOutletId, scope, 'vm.outlet');
        PossibleOutletPhoto.bindAll({ possibleOutletId }, scope, 'vm.photos');
      },

      savePossibleOutletLocation(possibleOutlet, location) {
        Location.inject(location);
        possibleOutlet.locationId = location.id;
        return possibleOutlet.DSCreate();
      },

    };

  }

  module.service('SalesService', SalesService);

})(angular.module('Sales'));
