(function (module) {

  function SalesService(Schema) {

    const { Outlet, Partner } = Schema.models();

    function findAllSalesmanOutlets(salesmanId) {

      let filter = Outlet.meta.salesmanFilter({ salesmanId });

      return Outlet.findAll(filter)
        .then(outlets =>
          Partner.findByMany(_.map(outlets, 'partnerId'), { chunk: 20 })
            .then(() => outlets));

    }

    return {
      findAllSalesmanOutlets,
    };

  }

  module.service('SalesService', SalesService);

})(angular.module('Sales'));
