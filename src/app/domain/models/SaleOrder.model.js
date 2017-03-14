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
          },
          Contract: {
            localField: 'contract',
            localKey: 'contractId'
          },
          PriceType: {
            localField: 'priceType',
            localKey: 'priceTypeId'
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
        processing: 'draft',
        docDiscounts: true
      },

      watchChanges: true,

      meta: {
        positionsCountRu
      },

      methods: {
        updateTotalCost: function () {
          this.totalCost = parseFloat(Schema.aggregate('cost').sum(this.positions).toFixed(2));
        },

        positionsCountRu,

        isValid: function () {
          return this.date &&
            this.outletId &&
            this.salesmanId &&
            this.contractId &&
            this.priceTypeId;
        }

      }

    });

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

  });

})();
