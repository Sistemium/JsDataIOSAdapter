'use strict';

(function () {

  angular.module('Models').run((Schema, moment) => {

    Schema.register({

      name: 'Debt',

      relations: {
        hasOne: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          },
          Responsibility: {
            localField: 'responsible',
            localKey: 'responsibility'
          }
        },
        hasMany: {
          Cashing: {
            localField: 'cashings',
            foreignKey: 'debtId'
          }
        }
      },

      defaultValues: {},

      watchChanges: false,

      meta: {},

      methods: {
        uncashed: function () {
          return this.summ - Schema.aggregate('summ').sum(_.filter(this.cashings, cashing => !cashing.isProcessed));
        },
        isOverdue: function () {
          return this.dateE < moment().format();
        },
        paymentTerm: function () {
          return moment.duration(moment().add(-1, 'day').diff(this.dateE)).days();
        }
      }

    });

  });

})();
