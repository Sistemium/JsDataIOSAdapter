'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'SalesmanOutletRestriction',

      relations: {
        hasOne: {
          // Restriction: {
          //   localField: 'restriction',
          //   localKey: 'restrictionId'
          // },
          // Outlet: {
          //   localField: 'outlet',
          //   localKey: 'outletId'
          // },
          // Salesman: {
          //   localField: 'salesman',
          //   localKey: 'salesmanId'
          // }
        }
      }

    });

  });

})();
