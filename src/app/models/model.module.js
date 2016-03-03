'use strict';

(function () {

  angular.module('webPage')
    .service('models',function(DS, DSUtils, $window, $log){

      function MyCustomAdapter() {

      }

      MyCustomAdapter.prototype.findAll = function () {
        // Must return a promise that resolves with the found items
        return new DSUtils.Promise(function (resolve) {
          $log.log('yeah!');
          if ($window.webkit) {
            $window.webkit.messageHandlers.findAll.postMessage({
              entity: 'Article',
              options: {
                requestId: 1,
                pageSize: 10,
                startPage: 1
              }
            });
          } else {
            $log.log('webkit not defined');
          }
          resolve();
        });
      };

      var id = 2;

      MyCustomAdapter.prototype.create = function (definition, attrs) {
        return new DSUtils.Promise(function (resolve) {
          attrs.id = id++;
          resolve (attrs);
        });
      };

      DS.registerAdapter('my', new MyCustomAdapter(), {default: true});

      var entity = DS.defineResource('entity');

      $window.iSistemiumIOSCallback = function (data, options) {
        DS.inject('entity',angular.extend ({id:1},data));
        return entity;
      };

      return entity;

    }).run (function (models,$log){
      models.findAll().then(function () {
        $log.log('findAll resolved');
      });
    });

}());
