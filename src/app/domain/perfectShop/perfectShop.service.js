(function (module) {

  const NO_CACHE = { bypassCache: true };

  function PerfectShopService($uibModal, $q, SalesmanAuth, Schema) {

    const { OutletStats } = Schema.models();

    return {

      outletModal(outletId) {

        const modal = $uibModal.open({

          animation: false,
          templateUrl: 'app/domain/perfectShop/outletPerfectShopInfo/outletPerfectShopModal.html',

          // size: 'sm',
          windowClass: 'perfect-shop-modal modal-info',
          // scope,
          // bindToController: false,
          controllerAs: 'vm',
          controller() {

            _.assign(this, {
              closeClick() {
                modal.close();
              },
            });

            findCurrentStat(outletId)
              .then(stat => {
                this.statId = _.get(stat, 'id') || null;
              })

          },

        });

        modal.result
          .then(_.noop, _.noop);

      },

      findCurrentStat,

    };

    function findCurrentStat(outletId) {

      const { id: salesmanId } = SalesmanAuth.getCurrentUser() || {};

      if (!salesmanId) {
        return $q.reject(new Error(`No salesmanId in findCurrentStat for ${outletId}`));
      }

      const filter = {
        salesmanId,
        outletId,
        // TODO: get current month auto
        dateB: '2021-03-01',
        dateE: '2021-03-31',
      };

      return OutletStats.findAll(filter, NO_CACHE)
        .then(_.first);

    }

  }

  module.service('PerfectShopService', PerfectShopService);

})(angular.module('Sales'));
