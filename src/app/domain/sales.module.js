'use strict';

(function () {

  let SUBSCRIPTIONS = ['Stock', 'SaleOrder', 'SaleOrderPosition'];

  angular.module('Sales', ['sistemium', 'yaMap', 'Models'])
    .run(function (SalesmanAuth, InitService, Sockets, IOS, DEBUG, Schema) {

      InitService.then(SalesmanAuth.init)
        .then(salesmanAuth => {

          if (IOS.isIos()) {
            SUBSCRIPTIONS.push('RecordStatus');
            Sockets.onJsData('jsData:update', onRecordStatus);
          }

          if (salesmanAuth.getCurrentUser() || salesmanAuth.hasOptions) {
            DEBUG('Sales module will jsDataSubscribe:', SUBSCRIPTIONS);
            Sockets.jsDataSubscribe(SUBSCRIPTIONS);
          }

        });

      function onRecordStatus(event) {

        if (event.resource !== 'RecordStatus') return;

        try {
          Schema
            .model(event.data.name)
            .eject(event.data.objectXid);
        } catch(e) {
          console.warn('onRecordStatus error:', e);
        }

      }

    });

})();
