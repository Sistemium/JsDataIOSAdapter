'use strict';

(function () {

  let SUBSCRIPTIONS = ['Stock', 'SaleOrder', 'SaleOrderPosition'];

  angular.module('Sales', ['sistemium', 'yaMap', 'Models'])
    .run(function (SalesmanAuth, InitService, Sockets, IOS, DEBUG) {

      InitService.then(SalesmanAuth.init)
        .then(salesmanAuth => {

          if (IOS.isIos()) {
            SUBSCRIPTIONS.push('RecordStatus');
          }

          if (salesmanAuth.getCurrentUser() || salesmanAuth.hasOptions) {
            DEBUG('Sales module will jsDataSubscribe:', SUBSCRIPTIONS);
            Sockets.jsDataSubscribe(SUBSCRIPTIONS);
          }

        });

    });

})();
