(function (module) {


  module.component('saleOrderDiscountInfo', {

    bindings: {
      saleOrder: '<'
    },

    templateUrl: 'app/domain/sales/saleOrder/saleOrderDiscountInfo/saleOrderDiscountInfo.html',

    controller: saleOrderDiscountInfoController,
    controllerAs: 'vm'

  });

  function saleOrderDiscountInfoController() {

    _.assign(this, {
      popoverTrigger: 'outsideClick',
      click
    });

    function click() {

    }

  }

})(angular.module('Sales'));
