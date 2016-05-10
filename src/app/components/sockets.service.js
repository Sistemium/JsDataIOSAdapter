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

    var subscribed = [];

    function subscribeCallback (msg,data) {
      subscribed = data.entities;
      //toastr.info(angular.toJson(data),'subscribeCallback');
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

    var subscriptions = {

    };

    return {
      init: function () {

      },
      on: onFn,
      onJsData: onFn,
      jsDataSubscribe: function (filter) {

        var id = uuid.v4();

        subscriptions[id] = {
          id: id,
          filter: filter
        };

        ios.messageHandlers[SUBSCRIBE].postMessage ({
          entities: filter,
          callback: CALLBACK,
          dataCallback: DATACALLBACK
        });

        return function(){
          delete subscriptions[id];
          var unsub = [];
          _.each(subscriptions,function(val){
            Array.prototype.push.apply(unsub,val.filter);
          });

          if (_.difference(subscribed, unsub)) {
            ios.messageHandlers[SUBSCRIBE].postMessage({
              entities: unsub,
              callback: CALLBACK,
              dataCallback: DATACALLBACK
            });
          }
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
