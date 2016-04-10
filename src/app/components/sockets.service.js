'use strict';

angular.module('core.services')
  .service('Sockets', function (InitService, $rootScope, $q) {

    var socket = io({
      autoConnect: false,
      path: '/socket.io-client'
    });

    function init(app) {
      socket.io.uri = app.url.socket;
      socket.open();
    }

    InitService.then(init);

    var svc = {
      io: socket,
      init: init,
      on: function (eventName, callback) {
        var wrappedCallback = function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        };
        socket.on(eventName, wrappedCallback);
        return function unSubscribe() {
          socket.removeListener(eventName, wrappedCallback);
        };
      },
      emit: function (eventName, data, callback) {

        if ((angular.isFunction(data)) && !callback) {
          if (!socket.connected) {
            return data.apply(socket, [{
              error: 'Нет подключения к серверу'
            }]);
          }
          socket.emit(eventName, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (data) {
                data.apply(socket, args);
              }
            });
          });
        } else {
          // if (!socket.connected) {
          //   return callback && callback.apply(socket, [{
          //     error: 'Нет подключения к серверу'
          //   }]);
          // }
          socket.emit(eventName, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          });
        }
      },
      emitQ: function (eventName, data) {

        var q = $q.defer();

        svc.emit(eventName, data, function (reply) {
          if (!reply) {
            q.resolve();
          } else if (reply.data) {
            q.resolve(reply.data);
          } else if (reply.error) {
            q.reject(reply);
          }
        });

        return q.promise;
      },
      removeAllListeners: function () {
        socket.removeAllListeners();
      },
      removeListener: function (event, fn) {
        socket.removeListener(event, fn);
      }
    };

    return svc;

  });
