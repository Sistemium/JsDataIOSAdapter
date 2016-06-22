'use strict';

(function () {

  angular.module('Sales',['sistemium','yaMap'])
    .run(function(SalesmanAuth,InitService){
      InitService.then(SalesmanAuth.init);
    });

})();
