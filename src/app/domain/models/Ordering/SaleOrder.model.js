'use strict';

(function () {

  angular.module('Models').run(function (Schema, Language, $q, DEBUG, Auth) {

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
        nextShipmentDate,
        workflowSaleOrder: false,
        workflowSaleOrderSupervisor: false
      },

      computed: {

        workflowStep: ['authId', 'processing', function (authId, processing) {
          let wf = SaleOrder.meta.workflowSaleOrder;
          if (authId && authId !== Auth.authId()) {
            wf = SaleOrder.meta.workflowSaleOrderSupervisor;
          }
          return _.get(wf, processing);
        }]

      },

      methods: {

        updateTotalCost: function () {
          this.totalCost = parseFloat(Schema.aggregate('cost').sum(this.positions).toFixed(2));
          this.totalCostDoc = this.totalCost;
          this.deviceTs = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        },

        positionsCountRu,

        processingMessages: function() {
          if (!this.processingMessage) return null;
          return _.map(this.processingMessage.split('|'), msg => _.trim(msg));
        },

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

          let lastModified = this.deviceTs;

          return $q.all(_.map(positions, position => position.safeSave()))
            .then(() => {

              if (!SaleOrder.hasChanges(this)) return;

              let nowModified = this.deviceTs;

              if (this.deviceTs !== lastModified) {
                // SaleOrder.revert(this);
                return console.warn('Ignore SaleOrder update after update position', nowModified, lastModified);
              }

              let changedKeys = _.keys(_.get(SaleOrder.changes(this), 'changed'));

              DEBUG('SaleOrder.safeSave changedKeys:', changedKeys);

              // only deviceTs changed
              if (!changedKeys.length) {
                return console.info('SaleOrder has changes but no changedKeys');
              }

              return SaleOrder.create(this, {
                afterUpdate: (options, attrs) => {
                  let nowModified = this.deviceTs;
                  if (nowModified >= lastModified) {
                    options.cacheResponse = false;
                    console.warn('Ignore server response SaleOrder', nowModified, lastModified);
                  }
                  return $q.resolve(attrs);
                }
              });

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

      return today.add(increment, 'day').format();

    }

  });

})();
