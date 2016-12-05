'use strict';

(function () {

  angular.module('Sales',['sistemium','yaMap','Models'])
    .run(function(SalesmanAuth,InitService){
      InitService.then(SalesmanAuth.init);
    });

})();
