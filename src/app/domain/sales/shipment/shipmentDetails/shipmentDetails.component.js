(function () {

  angular.module('Sales')
    .component('shipmentDetails', {

      bindings: {
        shipmentId: '<',
        offsetTop: '<'
      },

      templateUrl: 'app/domain/sales/shipment/shipmentDetails/shipmentDetails.html',

      controller: shipmentDetailsController,
      controllerAs: 'vm'

    });


  function shipmentDetailsController(Schema, $scope, saControllerHelper, $q) {

    const { Shipment, Article } = Schema.models();

    const vm = saControllerHelper.setup(this, $scope);

    vm.use({

      $onInit,
      showPriceDoc: () => vm.shipment.totalCostDoc() - vm.shipment.totalCost() >= 0.01,

    });

    /*
    Init
     */


    function $onInit() {

      const { Shipment } = Schema.models();

      if (vm.shipmentId) {
        Shipment.find(vm.shipmentId);
        Shipment.bindOne(vm.shipmentId, $scope, 'vm.shipment');
        vm.setBusy(getData(vm.shipmentId));
      }

      vm.offsetTop = vm.offsetTop || 5;

    }

    /*
     Functions
     */

    function getData(shipmentId) {

      let bypassCache = true;

      // TODO: subscribe to socket and do not bypassCache

      return Shipment.find(shipmentId, { bypassCache })
        .then(item => item.DSLoadRelations(['ShipmentPosition', 'Driver'], { bypassCache }))
        .then(item => _.map(item.positions, position => _.pick(position, ['articleId', 'article'])))
        .then(itemArticles => {
          const loadIds = _.filter(itemArticles, a => !a.article);
          if (!loadIds.length) return;
          return Article.findAll({
            where: { id: { in: _.map(loadIds, 'articleId') } }
          });
        })
        .catch(e => {
          vm.error = e;
        });
    }

  }

})();
