'use strict';

(function () {

  angular.module('webPage')
    .service('InitService', function (Sockets) {

      Sockets.emitQ('jsData:subscribe', [
        'article'
      ]).then(function (reply) {
        console.log(reply);
      }).catch(function (err) {
        console.log(err);
      });

      Sockets.on('jsData:update:article', function (data) {
        console.log(data);
        alert(data);
      });

    }).run(function (InitService) {})
  ;

}());
