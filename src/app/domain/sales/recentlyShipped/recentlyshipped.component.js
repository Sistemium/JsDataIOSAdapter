(function (module) {

  module.component('recentlyShipped', {

    bindings: {
      outlet: '<',
      article: '<'
    },

    controller: recentlyShippedController,

    templateUrl: 'app/domain/sales/recentlyShipped/recentlyShipped.html',
    controllerAs: 'vm'

  });


  function recentlyShippedController(Schema, IOS, $q) {

    const {ShipmentPosition} = Schema.models();

    const vm = _.assign(this, {
      $onInit
    });


    function $onInit() {

      let filter = {
        articleId: vm.article.id,
        outletId: vm.outlet.id,
        'x-order-by:': '-shipment.date'
      };
      let options = {limit: 1, cacheResponse:false};

      if (IOS.isIos()) {
        delete filter.outletId;
        filter.where = {'ANY shipment': {'outletId': {'==': vm.outlet.id}}};
        options.limit = 100;
      }

      vm.busy = ShipmentPosition.findAll(filter, options)
        .then(positions => {

          return $q.all(_.map(positions, position => ShipmentPosition.loadRelations(position, ['Shipment'])))
            .then(() => {

              let position = _.last(_.orderBy(positions,'shipment.date'));

              vm.volume = _.get(vm.article.boxPcs(position.volume), 'full');
              vm.date = _.get(position, 'shipment.date');

            });

        })
        .finally(() => {
          vm.busy = false;
        });

    }

  }

})(angular.module('Sales'));
