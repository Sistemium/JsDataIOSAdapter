'use strict';

(function () {

  angular.module('Sales', ['sistemium', 'yaMap', 'Models'])
    .run(function (SalesmanAuth, InitService, Sockets, IOS, DEBUG) {

      InitService.then(SalesmanAuth.init)
        .then(salesmanAuth => {

        });

    });

})();
