'use strict';

(function () {

  function PartnerController(Schema, $state, $scope) {

    var vm = this;

    _.assign(vm, {

      partner: null,
      outlets: [],

      deletePartnerClick,
      editPartnerClick,
      toggleOutletsSection,
      newOutletClick

    });

    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');
    var rootState = 'sales.territory.partner';

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.disableNavs = !!_.get(to, 'data.disableNavs') || to.name === rootState;
    });

    findPartner();

    function findPartner() {

      vm.busyMessage = 'Загрузка контрагента…';

      vm.busy = Partner.find($state.params.id)
        .then((partner) => {

          vm.partner = partner;

          return Outlet.findAllWithRelations({partnerId: vm.partner.id})('Visit')
            .then((outlets) => {

              vm.outlets = outlets;
              _.each(vm.outlets, (o) => {

                var lastVisit = _.last(_.sortBy(o.visits, 'deviceCts'));
                o.lastVisitDate = lastVisit ? lastVisit.deviceCts : '';

              });

            });

        });

    }

    function deletePartnerClick() {
      alert('deletePartnerClick()');
    }

    function editPartnerClick() {
      alert('editPartnerClick()');
    }

    function toggleOutletsSection() {
      vm.collapseOutletsSection = !vm.collapseOutletsSection;
    }

    function newOutletClick() {
      $state.go('^.addOutlet');
    }

  }

  angular.module('webPage')
    .controller('PartnerController', PartnerController)
  ;

}());
