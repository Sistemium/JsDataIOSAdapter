(function (module) {

  const NO_CACHE = { bypassCache: true };

  function SalesService(Schema, $q) {

    const { Outlet, Partner, Location } = Schema.models();
    const { PossibleOutlet, PossibleOutletPhoto } = Schema.models();

    return {

      findAllSalesmanOutlets(salesmanId) {

        let filter = Outlet.meta.salesmanFilter({ salesmanId });

        return Outlet.findAll(filter)
          .then(outlets =>
            Partner.findByMany(_.map(outlets, 'partnerId'), { chunk: 20 })
              .then(() => outlets));

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
