'use strict';

(function () {

  angular.module('Models').run(function (Schema, Language, $q, DEBUG) {

    const wDict = {
      w1: 'позиция',
      w24: 'позиции',
      w50: 'позиций'
    };

    const SaleOrder = Schema.register({

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
        // date: Schema.config.parseDate,
        // totalCost: Schema.config.parseDecimal,
        // totalCostDoc: Schema.config.parseDecimal,
        cashOnShipment: Schema.config.parseBool,
        docDiscounts: Schema.config.parseBool,
        spoilerNotNeeded: Schema.config.parseBool
      },

      defaultValues: {
        processing: 'draft',
        docDiscounts: true
      },

      watchChanges: true,

      meta: {
        positionsCountRu,
        nextShipmentDate
      },

      methods: {

        workflow: function () {
          return Schema.workflowSaleOrder && Schema.workflowSaleOrder[this.processing];
        },

        updateTotalCost: function () {
          this.totalCost = parseFloat(Schema.aggregate('cost').sum(this.positions).toFixed(2));
          this.totalCostDoc = this.totalCost;
        },

        positionsCountRu,

        isValid: function () {
          return this.date &&
            this.outletId &&
            this.salesmanId &&
            this.contractId &&
            this.priceTypeId;
        },

        safeSave: function onSaleOrderChange() {

          const {SaleOrderPosition} = Schema.models();

          if (!this.isValid()) return $q.reject();

          if (!this.id) {
            return SaleOrder.create(this);
          }

          let positions = _.filter(this.positions, SaleOrderPosition.hasChanges);

          return $q.all(_.map(positions, position => position.safeSave()))
            .then(() => {

              if (!SaleOrder.hasChanges(this)) return;

              let changedKeys = _.keys(_.get(SaleOrder.changes(this), 'changed'));

              DEBUG('SaleOrder.safeSave changedKeys:', changedKeys);

              // TODO: need investigation why this happens
              if (!changedKeys.length) {
                return console.warn('SaleOrder has changes but no changedKeys');
              }

              // TODO: maybe unCachedSave isn't necessary since used JSD omit
              return SaleOrder.create(this);

            })
            .catch(err => {
              _.each(positions, SaleOrderPosition.revert);
              SaleOrder.revert(this);
              return $q.reject(err)
            });

        }

      }

    });

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

    function nextShipmentDate() {

      let today = moment(moment().format());
      let increment = (today.isoWeekday() === 6) ? 2 : 1;

<<<<<<< HEAD
      return today.add(increment, 'day').toISOString();
=======
      return today.add(increment, 'day').format();
>>>>>>> SaleOrders2

    }

  });

})();
