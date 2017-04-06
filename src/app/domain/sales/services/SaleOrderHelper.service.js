(function () {

  function SaleOrderHelper(Schema, DEBUG, Sockets, $state, toastr) {

    const {SaleOrder, SaleOrderPosition} = Schema.models();

    function setupController(vm, $scope) {


      function onJSData(event) {

        const saleOrderId = _.get(vm, 'saleOrder.id');

        let id = _.get(event, 'data.id');

        if (!id) return;

        let {data, resource} = event;

        if (resource === 'SaleOrder') {

          DEBUG('onJSData SaleOrder', event);

          if (SaleOrder.hasChanges(id)) {
            return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrder');
          }

          if (data.deviceCts) {
            // IOS

            DEBUG('onJSData IOS injecting', resource);
            SaleOrder.inject(data);

          } else {
            // Not IOS

            if (saleOrderId === data.id && data.ts <= _.get(vm, 'saleOrder.ts')) {
              return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrder with old ts');
            }

            SaleOrder.find(id, {bypassCache: true, cacheResponse:false})
              .then(saleOrder => {

                if (SaleOrder.hasChanges(id)) return;

                SaleOrder.inject(saleOrder);

                if (vm.date === saleOrder.date || saleOrderId === saleOrder.id) {
                  SaleOrderPosition.findAllWithRelations({saleOrderId: saleOrder.id}, {bypassCache: true})('Article');
                }

              })
              .catch(err => {
                if (err.error === 404) {
                  SaleOrder.eject(id)
                }
              });

          }

        } else if (resource === 'SaleOrderPosition' && saleOrderId) {

          if (data.saleOrderId === saleOrderId) {
            // IOS

            let position = getPosition(data.articleId);

            if (position && SaleOrderPosition.hasChanges(position)) {
              return DEBUG('CatalogueSaleOrder:onJSData', 'ignore position');
            }

            DEBUG('CatalogueSaleOrder:onJSData', 'inject position');

            position = SaleOrderPosition.inject(data);

            SaleOrderPosition.loadRelations(position);

          } else if (!data.saleOrderId) {
            // not IOS
            return SaleOrderPosition.find(id, {bypassCache: true, cacheResponse: false})
              .then(updated => {
                if (updated.saleOrderId === saleOrderId) {
                  let existing = getPosition(updated.articleId);
                  if (existing && (SaleOrderPosition.hasChanges(existing) || updated.ts <= existing.ts)) {
                    DEBUG('Ignore SaleOrderPosition', updated.ts, existing.ts);
                  } else {
                    SaleOrderPosition.inject(updated);
                    SaleOrderPosition.loadRelations(updated);
                  }
                }
              });
          }

        }

      }

      const SUBSCRIPTIONS = ['SaleOrder', 'SaleOrderPosition'];

      function onJSDataDestroy(event) {

        const saleOrderId = _.get(vm, 'saleOrder.id');

        DEBUG('onJSDataDestroy', event);
        let id = _.get(event, 'data.id');
        if (!id) return;

        if (SUBSCRIPTIONS.indexOf(event.resource) > -1) {
          Schema.model(event.resource).eject(id);
          if (id === saleOrderId) {
            toastr.error('Заказ удален');
            $state.go('^');
          }
        }

      }

      function getPosition(articleId) {
        return vm.saleOrder && _.find(vm.saleOrder.positions, {articleId: articleId});
      }

      $scope.$on('$destroy', Sockets.onJsData('jsData:destroy', onJSDataDestroy));
      $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

      _.defaults(vm, {});

    }

    return {setupController};

  }

  angular.module('webPage')
    .service('SaleOrderHelper', SaleOrderHelper);

})();
