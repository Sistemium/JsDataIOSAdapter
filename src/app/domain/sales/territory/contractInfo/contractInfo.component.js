(function (module) {

  const contractInfo = {

    bindings: {
      contractId: '=?',
      contract: '=?',
      popoverOpen: '=?'
    },

    transclude: true,

    controller: contractInfoController,
    templateUrl: 'app/domain/sales/territory/contractInfo/contractInfo.html',
    controllerAs: 'vm'

  };

  function contractInfoController() {

    // const vm =
    _.assign(this, {
      $onInit
    });


    function $onInit() {
      // let {creditLimit, creditRemains} = contract;
    }

  }

  module.component('contractInfo', contractInfo);

})(angular.module('webPage'));
