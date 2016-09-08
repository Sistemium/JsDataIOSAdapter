'use strict';

(function () {

  function EditOutletController(Schema, $state) {

    var vm = this;

    _.assign(vm, {

      busy: null,

      outlet: null,
      partner: null,
      partners: [],
      selectedPartner: null,

      address: '',

      selectPartner

    });

    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');

    vm.busy = findOutlet();

    function findOutlet() {

      return Outlet.find($state.params.id)
        .then(function (outlet) {

          vm.outlet = outlet;
          vm.address = outlet.address;

          return Partner.findAll()
            .then(function (partners) {

              vm.partners = _.sortBy(partners, (p) => [_.toLower(p.shortName), _.toLower(p.name)]);
              vm.partner = _.find(partners, {id: outlet.partnerId});

            });

        });

    }

    function selectPartner(partner) {
      vm.selectedPartner = partner;
    }


  }

  angular.module('webPage')
    .controller('EditOutletController', EditOutletController);

})
();
