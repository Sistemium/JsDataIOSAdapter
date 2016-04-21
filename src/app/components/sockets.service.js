'use strict';

angular.module('core.services')
  .service('iosSockets', function($window,toastr,$q) {

    var SUBSCRIBE = 'subscribe';
    var CALLBACK = 'iosSocketsJsDataSubscribe';
    var DATACALLBACK = 'iosSocketsJsDataSubscribeData';

    var ons = [];

    var ios = $window.webkit;

    function subscribeDataCallback (data) {
      _.each(data,function (e){

        console.info(angular.toJson({
          data: data, ons: ons.length
        }),'subscribeDataCallback');

        _.each (ons,function(subscription){
          if (subscription.event === 'jsData:update') {
            subscription.callback ({
              resource: e.entity,
              data: {
                id: e.xid
              }
            });
          }
        });

      });
    }

    function subscribeCallback (data) {
      console.info(angular.toJson(data),'subscribeCallback');
    }

    $window[DATACALLBACK] = subscribeDataCallback;
    $window[CALLBACK] = subscribeCallback;

    function onFn (event,callback) {

      var subscription = {
        event: event,
        callback: callback
      };

      ons.push(subscription);

      return function () {
        ons.splice(ons.indexOf(subscription),1);
      };

    }

    return {
      init: function () {

      },
      on: onFn,
      onJsData: onFn,
      jsDataSubscribe: function (filter) {

        ios.messageHandlers[SUBSCRIBE].postMessage ({
          entities: filter,
          callback: CALLBACK,
          dataCallback: DATACALLBACK
        });

        return function(){
          ios.messageHandlers[SUBSCRIBE].postMessage ({
            entities: [],
            callback: CALLBACK,
            dataCallback: DATACALLBACK
          });
        };
      },
      emitQ: function() {
        return $q(function(resolve,reject){
          reject (false);
        });
      }
    };

  })
  .service('Sockets', function (saSockets,$window,iosSockets) {

    if ($window.webkit) {
      return iosSockets;
    } else {
      return saSockets;
    }

  });
