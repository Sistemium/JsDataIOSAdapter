'use strict';

angular.module('webPage')
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
          socket.emit(eventName, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if (data) {
                data.apply(socket, args);
              }
            });
          });
        } else {
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
          if (reply.data) {
            q.resolve (reply.data);
          } else {
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
