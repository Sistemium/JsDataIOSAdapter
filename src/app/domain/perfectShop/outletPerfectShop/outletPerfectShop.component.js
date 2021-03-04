(function () {

  const URL = 'app/domain/perfectShop/outletPerfectShop';

  angular.module('Sales')
    .component('outletPerfectShop', {

      bindings: {
        statId: '<',
      },

      templateUrl: `${URL}/outletPerfectShop.html`,
      controller: outletPerfectShopController,
      controllerAs: 'vm'

    });

  /** @ngInject */
  function outletPerfectShopController($scope, saControllerHelper, Schema) {

    const { OutletStats } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope)
      .use({

        $onInit() {
          this.rebindOne(OutletStats, this.statId, 'vm.stat', onStat);
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

    function onStat() {

      const { stats, outlet } = vm.stat || {};
      const { blocks, assortments, level, nextLevel } = _.get(stats, 'perfectShop') || {};

      const assortmentMap = assortmentByBlock(assortments);

      _.assign(vm, {
        outlet,
        blocks: _.map(blocks, block => {
          const blockAssortment = assortmentMap[block.name];
          return _.assign({
            assortments: blockAssortment.map(a => _.assign({
              rowspan: _.filter(blockAssortment, { name: a.name }).length
            }, a)),
            rowspan: blockAssortment.length,
          }, block);
        }),
        level,
        nextLevel,
      });

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
