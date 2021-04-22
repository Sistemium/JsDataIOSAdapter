(function (module) {

  const NO_CACHE = { bypassCache: true };

  function PerfectShopService($uibModal, $q, SalesmanAuth, Schema, DomainOption, moment) {

    const { OutletStats } = Schema.models();

    return {

      isResponsible(salesman) {
        return salesman && DomainOption.perfectShopResponsibility().includes(salesman.responsibility);
      },

      outletModal(outletId, date) {

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

            findCurrentStat(outletId, date)
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

    function findCurrentStat(outletId, date) {

      const { id: salesmanId } = SalesmanAuth.getCurrentUser() || {};

      if (!salesmanId) {
        return $q.reject(new Error(`No salesmanId in findCurrentStat for ${outletId}`));
      }

      const filter = {
        salesmanId,
        outletId,
        dateB: moment(date).startOf('month').format('YYYY-MM-DD'),
        dateE: moment(date).endOf('month').format('YYYY-MM-DD'),
      };

      return OutletStats.findAll(filter, NO_CACHE)
        .then(_.first);

    }

  }

  module.service('PerfectShopService', PerfectShopService);

})(angular.module('Sales'));
