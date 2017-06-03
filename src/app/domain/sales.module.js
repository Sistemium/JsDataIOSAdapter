'use strict';

(function () {

  let SUBSCRIPTIONS = ['Stock', 'SaleOrder', 'SaleOrderPosition', 'Outlet'];

  angular.module('Sales', ['sistemium', 'yaMap', 'Models'])
    .run(function (SalesmanAuth, InitService, Sockets, IOS, DEBUG, Schema, $rootScope, Menu, Auth) {

      const {Workflow, SaleOrder, Outlet} = Schema.models();

      InitService.then(SalesmanAuth.init)
        .then(salesmanAuth => {

          if (IOS.isIos()) {
            SUBSCRIPTIONS.push('RecordStatus');
          }

          Sockets.onJsData('jsData:update', onRecordStatus);

          if (salesmanAuth.getCurrentUser() || salesmanAuth.hasOptions) {
            DEBUG('Sales module will jsDataSubscribe:', SUBSCRIPTIONS);
            Sockets.jsDataSubscribe(SUBSCRIPTIONS);
          }

          getWorkflow('SaleOrder.v2', 'workflowSaleOrder');

          if (Auth.isAuthorized('supervisor')) {
            getWorkflow('SaleOrder.v2.sv', 'workflowSaleOrderSupervisor');
          }

          function setBadges() {
            let filter = SalesmanAuth.makeFilter({processing: 'draft'});
            SaleOrder.groupBy(filter)
              .then(data => {
                Menu.setItemData('sales.saleOrders', {badge: data.length});
              });
          }

          $rootScope.$on('menu-show', setBadges);

          setBadges();

        });

      function getWorkflow(code, codeAs) {

        Workflow.findAll({code})
          .then(workflow => {
            SaleOrder.meta[codeAs] = _.get(_.first(workflow), 'workflow');
          })
          .catch(e => console.error('Workflow find error:', e));

      }

      function onRecordStatus(event) {

        if (event.resource === 'Outlet') {
          if (event.data.name) {
            Outlet.inject(event.data);
          } else {
            Outlet.find(event.data.id, {bypassCache: true});
          }
        }

        if (event.resource !== 'RecordStatus') return;

        try {
          Schema
            .model(event.data.name)
            .eject(event.data.objectXid);
        } catch (e) {
          console.warn('onRecordStatus error:', e);
        }

      }

    });

})();
