'use strict';

(function () {

  angular.module('Models').run((Schema) => {

    Schema.register({

      name: 'Cashing',

      relations: {
        hasOne: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          },
          Debt: {
            localField: 'debt',
            localKey: 'debtId'
          }
        }
      },

      defaultValues: {
      },

      watchChanges: false,

      meta: {
      },

      methods: {
      }

    });

  });

})();
