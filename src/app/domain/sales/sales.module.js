'use strict';

(function () {

  angular.module('Sales',['sistemium'])
    .run(function(SalesmanAuth,InitService){
      InitService.then(SalesmanAuth.init);
    });

})();
