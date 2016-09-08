'use strict';

(function () {

  function EditOutletController(Schema, $state/*, $scope*/) {

    var vm = this;

    _.assign(vm, {

      busy: null,

      outlet: null,
      partner: null,
      partners: [],
      initialPartner: null,
      selectedPartner: null,

      address: '',

      selectPartner

    });

    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');

    vm.busy = findOutlet();

    //$scope.$watch('vm.partner', (newValue) => {
    //  console.log('vm.partner', newValue);
    //});
    //
    //$scope.$watch('vm.selectedPartner', (newValue) => {
    //  console.log('vm.selectedPartner', newValue);
    //});

    function findOutlet() {

      return Outlet.find($state.params.id)
        .then((outlet) => {

          vm.outlet = outlet;
          vm.address = outlet.address;

          return Partner.findAll()
            .then((partners) => {

              vm.partners = _.sortBy(partners, (p) => [_.toLower(p.shortName), _.toLower(p.name)]);
              vm.partner = _.find(partners, {id: outlet.partnerId});
              vm.initialPartner = vm.partner;
              vm.selectedPartner = vm.partner;

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
