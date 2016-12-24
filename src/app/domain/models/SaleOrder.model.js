'use strict';

(function () {

  angular.module('Models').run(function (Schema, Language) {

    const wDict = {
      w1: 'позиция',
      w24: 'позиции',
      w50: 'позиций'
    };

    Schema.register({

      name: 'SaleOrder',

      relations: {
        hasOne: {
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          }
        },
        hasMany: {
          SaleOrderPosition: {
            localField: 'positions',
            foreignKey: 'saleOrderId'
          }
        }
      },

      fieldTypes: {
        date: 'date',
        totalCost: 'decimal',
        totalCostDoc: 'decimal'
      },

      defaultValues: {
        processing: 'draft'
      },

      meta: {
        positionsCountRu
      },

      methods: {
        updateTotalCost: function () {
          this.totalCost = parseFloat(Schema.aggregate('cost').sum(this.positions).toFixed(2));
        },

        positionsCountRu,

        isValid: function () {
          return this.outletId && this.salesmanId && this.date;
        }

      }

    });

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

  });

})();
