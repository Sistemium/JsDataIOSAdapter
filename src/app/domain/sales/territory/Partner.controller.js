'use strict';

(function () {

  function PartnerController(Schema, $state, $scope, ConfirmModal, saControllerHelper, SalesmanAuth) {

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      partner: null,
      outlets: [],
      outletLastVisitDate: {},

      deletePartnerClick,
      editPartnerClick,
      toggleOutletsSection,
      outletClick,
      newOutletClick

    });

    const {Partner, Outlet} = Schema.models();
    const rootState = 'sales.territory.partner';

    $scope.$on('$stateChangeSuccess', (e, to) => {
      vm.disableNavs = !!_.get(to, 'data.disableNavs') || to.name === rootState;
    });

    SalesmanAuth.watchCurrent($scope, findPartner);

    /*
    Functions
     */

    function findPartner() {

      let q = Partner.find($state.params.id)
        .then(partner => {

          vm.partner = partner;

          let filter = SalesmanAuth.makeFilter({partnerId: partner.id});

          filter = Outlet.meta.salesmanFilter(filter);

          return Outlet.findAllWithRelations(filter, {bypassCache: true})('Visit')
            .then(outlets => {

              vm.outlets = outlets;

              _.each(outlets, o => {
                vm.outletLastVisitDate [o.id] = _.get(_.last(_.sortBy(o.visits, 'deviceCts')), 'deviceCts') || '';
              });

            });

        });

      return vm.setBusy(q);

    }

    function deletePartnerClick() {
      ConfirmModal.show({
        text: `Действительно удалить запись о контрагенте ${vm.partner.name}?`
      })
        .then(() => {
          return Partner.destroy(vm.partner.id)
            .then(quit)
            .catch(err => alert(err.text));
        })
    }

    function editPartnerClick() {
      return $state.go('^.editPartner', {id: vm.partner.id});
    }

    function toggleOutletsSection() {
      vm.collapseOutletsSection = !vm.collapseOutletsSection;
    }

    function outletClick(outlet) {
      $state.go('^.outlet', {id: outlet.id});
    }

    function newOutletClick() {
      $state.go('.addOutletToPartner', {id: vm.partner.id});
    }

    function quit() {
      return $state.go('^');
    }

  }

  angular.module('webPage')
    .controller('PartnerController', PartnerController)
  ;

})();
