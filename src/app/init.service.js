'use strict';

(function () {

  angular.module('webPage')
    .service('InitService', function (Sockets) {

      function init () {
        Sockets.on('jsData:update',function(data){
          console.log ('jsData:update', data);
        });
      }
      
      return {
        init: init
      };
      
    }).run(function (InitService) {
      InitService.init();
    })
  ;

}());
