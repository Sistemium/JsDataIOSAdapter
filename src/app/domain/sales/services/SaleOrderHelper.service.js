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

          }

        } else if (resource === 'SaleOrderPosition' && saleOrderId) {

          if (data.saleOrderId === saleOrderId) {

            let position = getPosition(data.articleId);

            if (position) {
              if (SaleOrderPosition.hasChanges(position)) {
                return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrderPosition with changes');
              }

              if (data.deviceTs < position.deviceTs) {
                return DEBUG('CatalogueSaleOrder:onJSData', 'ignore saleOrderPosition with old deviceTs');
              }
            } else if (SaleOrderPosition.meta.isDeleted(data.id)) {
              console.warn('SaleOrderHelper ignore deleted position', data.id);
              return;
            }

            DEBUG('CatalogueSaleOrder:onJSData', 'inject position');

            position = SaleOrderPosition.inject(data);

            SaleOrderPosition.loadRelations(position);

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

        if (!_.get(saleOrder, 'workflowStep.editable')) {
          return saveUpdateSaleOrderProcessing();
        }

        return saleOrder.DSLoadRelations('positions')
          .then(() => {
            saleOrder.updateTotalCost();
            return saveUpdateSaleOrderProcessing()
          });

        function saveUpdateSaleOrderProcessing() {

          saleOrder.processing = processing;

          return saleOrder.safeSave()
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

      }


      function checkLimit() {

        vm.overLimit = 0;

        if (!vm.saleOrder || !_.get(vm.saleOrder, 'workflowStep.editable')) {
          return;
        }

        let {contract = {}, totalCost} = vm.saleOrder;

        let {creditLimit, creditRemains} = contract;

        if (!creditLimit) {
          return;
        }

        let overLimit = totalCost - creditRemains;

        if (overLimit > 0) {
          // let msg = `<div>Лимит: <b>${numberFilter(creditLimit, 2)}</b></div>` +
          //   `<div>Сумма превышения: <b>${numberFilter(overLimit, 2)}</b></div>`;
          // toastr.error(msg, 'Превышен лимит по договору', {preventDuplicates: true});
          vm.overLimit = overLimit;
        }

      }

      $scope.$watchGroup([
        'vm.saleOrder.totalCost',
        'vm.saleOrder.contract.creditRemains',
        'vm.saleOrder.workflowStep.editable'
      ], checkLimit);

      $scope.$on('$destroy', Sockets.onJsData('jsData:destroy', onJSDataDestroy));
      $scope.$on('$destroy', Sockets.onJsData('jsData:update', onJSData));

      _.defaults(vm, {setProcessingClick});

    }

    return {setupController};

  }

  angular.module('webPage')
    .service('SaleOrderHelper', SaleOrderHelper);

})();
