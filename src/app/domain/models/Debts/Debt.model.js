'use strict';

(function () {

  angular.module('Models').run((Schema) => {

    Schema.register({

      name: 'Debt',

      relations: {
        hasOne: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          }
        },
        hasMany: {
          Cashing: {
            localField: 'cashings',
            foreignKey: 'debtId'
          }
        }
      },

      defaultValues: {
      },

      watchChanges: false,

      meta: {
      },

      methods: {
        uncashed: function () {
          return this.summ - Schema.aggregate('summ').sum(_.filter(this.cashings, cashing => !cashing.isProcessed));
        }
      }

    });

  });

})();
