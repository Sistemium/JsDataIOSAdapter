'use strict';

(function () {

  function PartnerController(Schema, $state) {

    var vm = this;

    _.assign(vm, {

      partner: null,
      outlets: []

    });

    var Partner = Schema.model('Partner');
    var Outlet = Schema.model('Outlet');

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


  }

  angular.module('webPage')
    .controller('PartnerController', PartnerController)
  ;

}());
