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

            if (SaleOrder.hasChanges(id)) {
              return DEBUG('CatalogueSaleOrder:onJSData:ios', 'ignore saleOrder with changes');
            }

            if (data.deviceTs < _.get(vm, 'saleOrder.ts')) {
              return DEBUG('CatalogueSaleOrder:onJSData:ios', 'ignore saleOrder with old deviceTs');
            }

            DEBUG('CatalogueSaleOrder:onJSData injecting:ios', resource);
            SaleOrder.inject(data);

            if (vm.date === data.date) {
              SaleOrderPosition.findAllWithRelations({saleOrderId: data.id}, {bypassCache: true})('Article');
            }

          } else {
            // Not IOS

            if (saleOrderId === data.id && data.ts <= _.get(vm, 'saleOrder.ts')) {
              return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrder with old ts');
            }

            SaleOrder.find(id, {bypassCache: true, cacheResponse: false})
              .then(saleOrder => {

                if (SaleOrder.hasChanges(id)) return;

                if (saleOrder.ts <= _.get(vm, 'saleOrder.ts')) {
                  return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrder with old ts after find');
                }

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

            if (position) {
              if (SaleOrderPosition.hasChanges(position)) {
                return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrderPosition with changes');
              }

              if (data.deviceTs < position.deviceTs) {
                return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrderPosition with old deviceTs');
              }
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

      function onJSDataDestroy(event) {

        DEBUG('SaleOrderHelper onJSDataDestroy', event);
        let id = _.get(event, 'data.id');

        if (id && id === _.get(vm, 'saleOrder.id') || id === $state.params.id) {
          toastr.error('Заказ удален');
          $state.go('^');
        }

      }

      function getPosition(articleId) {
        return vm.saleOrder && _.find(vm.saleOrder.positions, {articleId: articleId});
      }

      function setProcessingClick(processing) {

        let {saleOrder} = vm;

        if (_.get(saleOrder, 'workflowStep.editable')) {
          saleOrder.updateTotalCost();
        }

        saleOrder.processing = processing;

        saleOrder.safeSave()
          .then(saleOrder => {

            let workflowStep = _.get(saleOrder, 'workflowStep');

            if (!workflowStep) {
              return;
            }

            let {desc, label} = workflowStep;

            toastr.info(desc, `Статус заказа: ${label}`);

          })
          .catch(e => toastr.info(angular.toJson(e), 'Ошибка сохранения'));

      }


      $scope.$on('$destroy', Sockets.onJsData('jsData:destroy', onJSDataDestroy));
      $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

      _.defaults(vm, {setProcessingClick});

    }

    return {setupController};

  }

  angular.module('webPage')
    .service('SaleOrderHelper', SaleOrderHelper);

})();
