(function () {

  angular.module('Warehousing')
    .component('warehouseItemInfo', {

      bindings: {
        warehouseItem: '<',
      },

      controller: warehouseItemInfoController,

      templateUrl: 'app/domain/warehousing/warehouseBoxing/itemInfo/warehouseItemInfo.html',
      controllerAs: 'vm',

    });

  function warehouseItemInfoController() {

  }

})();
