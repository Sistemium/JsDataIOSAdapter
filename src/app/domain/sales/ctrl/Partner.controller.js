'use strict';

(function () {

  function PartnerController(Schema, $state, $scope, ConfirmModal) {

    let vm = this;

    _.assign(vm, {

      partner: null,
      outlets: [],
      outletLastVisitDate: {},

      deletePartnerClick,
      editPartnerClick,
      toggleOutletsSection,
      outletClick,
      newOutletClick

    });

    let {Partner, Outlet} = Schema.models();
    let rootState = 'sales.territory.partner';

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.disableNavs = !!_.get(to, 'data.disableNavs') || to.name === rootState;
    });

    findPartner();

    function findPartner() {

      vm.busyMessage = 'Загрузка контрагента…';

      vm.busy = Partner.find($state.params.id)
        .then((partner) => {
          vm.partner = partner;
          return Outlet.findAllWithRelations({partnerId: partner.id}, {bypassCache: true})('Visit')
            .then(outlets => {

              vm.outlets = outlets;

              _.each(outlets, o => {
                vm.outletLastVisitDate [o.id] = _.get(_.last(_.sortBy(o.visits, 'deviceCts')), 'deviceCts') || '';
              });

            });
        });

    }

    function deletePartnerClick() {
      ConfirmModal.show({
        text: `Действительно удалить запись о контрагенте ${vm.partner.name}?`
      })
        .then(function () {
          return Partner.destroy(vm.partner.id)
            .then(quit)
            .catch((err) => alert(err.text));
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
