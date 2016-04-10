'use strict';

(function () {

  angular.module('webPage')
    .service('InitService', function (Sockets) {

      var DEBUG = debug ('stg:InitService')

      function init () {
        Sockets.on('jsData:update',function(data){
          DEBUG ('jsData:update', data);
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
