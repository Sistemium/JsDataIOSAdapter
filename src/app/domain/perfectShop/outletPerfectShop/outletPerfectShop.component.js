(function () {

  const URL = 'app/domain/perfectShop/outletPerfectShop';

  angular.module('Sales')
    .component('outletPerfectShop', {

      bindings: {
        statId: '<',
        outletId: '<',
      },

      templateUrl: `${URL}/outletPerfectShop.html`,
      controller: outletPerfectShopController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function outletPerfectShopController($scope, saControllerHelper, Schema, PerfectShopService) {

    const { OutletStats } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use({

        setLevel(nextLevel) {
          vm.nextLevel = nextLevel;
          vm.stat.setNextPSLevel(nextLevel);
        },

        $onInit() {
          if (this.statId) {
            this.rebindOne(OutletStats, this.statId, 'vm.stat', onStat);
          }
          if (this.outletId) {
            PerfectShopService.findCurrentStat(this.outletId)
              .then(stat => {
                this.stat = stat;
                onStat();
              });
          }
        },

        ruleName(rule) {
          switch (rule) {
            case 'countryCnt':
              return 'Страны';
            case 'skuCnt':
              return 'SKU';
            case 'brandCnt':
              return 'Бренды';
            case 'pieceCnt':
              return 'Бутылки';
            case 'litreCnt':
              return 'Литры';
          }
        },

      });

    function onLevel(nextLevel) {

      if (!nextLevel) {
        return;
      }

      const { ps } = vm;
      const { blocks, assortments } = ps.stats[nextLevel] || ps;

      const assortmentMap = assortmentByBlock(assortments);

      _.assign(vm, {
        blocks: _.map(blocks, block => {
          const blockAssortment = assortmentMap[block.name];
          return _.assign({
            assortments: blockAssortment.map(a => _.assign({
              rowspan: _.filter(blockAssortment, { name: a.name }).length
            }, a)),
            rowspan: blockAssortment.length,
          }, block);
        }),
      });

    }

    function onStat() {

      const { stats, outlet } = vm.stat || {};
      const ps = _.get(stats, 'perfectShop');

      if (!ps) {
        return;
      }

      const { level } = ps;

      _.assign(vm, {
        ps,
        outlet,
        level,
        nextLevel: vm.stat.getNextPSLevel(),
        levels: Object.keys(ps.stats),
      });

      vm.watchScope('vm.nextLevel', onLevel);

    }

    function assortmentByBlock(assortments) {

      const withBlock = _.map(assortments, assortment => {

        const [, blockName, name] = assortment.assortmentName.match(/^(.+) \/ (.+)$/);
        return _.assign({
          blockName,
          name,
        }, assortment);

      });

      return _.groupBy(withBlock, 'blockName');

    }

  }

})();
