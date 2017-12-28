'use strict';

(function () {

  angular.module('Models').run(function (Schema, Language, $q, DEBUG, Auth, $rootScope) {

    let caches = {};
    let minExpires = new Date();

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

        workflowStep: ['authId', 'processing', (authId, processing) => {

          let wf = SaleOrder.meta.workflowSaleOrder;

          if (!authId || authId !== Auth.authId()) {
            wf = SaleOrder.meta.workflowSaleOrderSupervisor;
          }

          return _.get(wf, processing);
        }]

      },

      methods: {

        totalCostCached: cachedValue('totalCost'),
        totalPositionsCached: cachedValue('positionsCount'),
        totalBoxesCached: cachedValue('totalBoxes'),

        updateTotalCost: function () {
          this.totalCost = parseFloat(Schema.aggregate('cost').sum(this.positions).toFixed(2));
          this.totalCostDoc = this.totalCost;
          this.deviceTs = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
        },

        positionsCountRu,

        processingMessages: function () {
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

    function cachedValue(name) {

      return function () {

        let cached = caches[this.id];

        if (!cached || cached.ts < minExpires) {
          cached = setCaches(this);
        }

        return cached[name];

      }
    }

    function setCaches(saleOrder) {

      let {id} = saleOrder;

      const {SaleOrderPosition} = Schema.models();

      const cached = caches[saleOrder.id] = caches[saleOrder.id] || {};

      cached.ts = new Date();

      SaleOrderPosition.findAll({saleOrderId: id}, {cacheResponse: false})
        .then(positions => {
          _.assign(cached, {
            //positions,
            positionsCount: positions.length || null,
            totalCost: Schema.aggregate('cost').sum(positions) || null,
            totalBoxes: Schema.aggregate('boxVolume').sumFn(positions) || null
          })
        });

      return cached;

    }

    function positionsCountRu(count) {
      return wDict[Language.countableState(count || this.positions.length)];
    }

    $rootScope.$watch(ifPositionsChanged, clearCaches);

    function clearCaches() {
      minExpires = new Date();
    }

    function ifPositionsChanged() {
      return `${Schema.model('SaleOrder').lastModified()}`;
    }

    function nextShipmentDate() {

      let today = moment(moment().format());
      let increment = (today.isoWeekday() === 6) ? 2 : 1;

      return today.add(increment, 'day').format();

    }

  });

})();
