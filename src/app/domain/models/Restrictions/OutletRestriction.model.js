'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'OutletRestriction',

      relations: {
        hasOne: {
          // Restriction: {
          //   localField: 'restriction',
          //   localKey: 'restrictionId'
          // },
          // Outlet: {
          //   localField: 'outlet',
          //   localKey: 'outletId'
          // }
        }
      }

    });

  });

})();
