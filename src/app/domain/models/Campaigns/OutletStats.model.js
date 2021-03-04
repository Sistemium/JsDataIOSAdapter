(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'OutletStats',

      relations: {
        belongsTo: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId',
          },
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId',
          },
        },
      },

      meta: {}

    });

  });

})();
