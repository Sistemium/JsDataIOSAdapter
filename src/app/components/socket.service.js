'use strict';

angular.module('core.services')
  .factory('Sockets', function($rootScope, $q) {

    var url = 'http://localhost:8000/';

    var socket = io(url, {
      path: '/socket.io-client'
    });

    var svc = {
      io: socket,
      on: function (eventName, callback) {
        socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
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
          if (!socket.connected) {
            return callback.apply(socket, [{
              error: 'Нет подключения к серверу'
            }]);
          }
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

        svc.emit(eventName, data, function (reply){
          if (!reply) {
            q.resolve();
          } else if (reply.data) {
            q.resolve (reply.data);
          } else if (reply.error) {
            q.reject (reply);
          }
        });

        return q.promise;
      },
      removeAllListeners: socket.removeAllListeners,
      removeListener: socket.removeListener
    };

    return svc;

  });
