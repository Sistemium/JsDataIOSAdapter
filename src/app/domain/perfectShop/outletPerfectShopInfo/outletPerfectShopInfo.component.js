(function (module) {

  module.component('outletPerfectShopInfo', {

    bindings: {
      outletId: '<',
      salesman: '<',
    },

    templateUrl: 'app/domain/perfectShop/outletPerfectShopInfo/outletPerfectShopInfo.html',

    controller: outletPerfectShopInfoController,
    controllerAs: 'vm'

  });

  function outletPerfectShopInfoController(saMedia, PerfectShopService) {

    _.assign(this, {

      click() {
        PerfectShopService.outletModal(this.outletId);
      },

      popoverTrigger: popoverTrigger()

    });

    function popoverTrigger() {
      return (saMedia.xsWidth || saMedia.xxsWidth) ? 'none' : 'outsideClick';
    }

  }

})(angular.module('Sales'));
