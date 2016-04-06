'use strict';

(function () {

  angular.module('webPage').service('SocketAdapter', function (Sockets) {

    var SocketAdapter = function () {
    };


    //function paramsToOptions (params) {
    //
    //  var parsed = {};
    //
    //  if (params.limit) {
    //    parsed.pageSize = params.limit;
    //  }
    //
    //  if (params.offset) {
    //    parsed.startPage = Math.ceil(params.offset / (params.limit || 1)) + 1;
    //  }
    //
    //  delete params.limit;
    //  delete params.offset;
    //
    //  return parsed;
    //}

    SocketAdapter.prototype.findAll = function (resource, params, options) {
      return new Promise(function (resolve) {
        Sockets.emit('jsData', {
          method: 'findAll',
          //TODO rename models with pool or set basePath for adapter or leave as it is now
          resource: 'dev/' + resource.name,
          params: params,
          options: options
        });

        Sockets.on('eventFromServer', function (data) {
          resolve(data);
        });
      });
    };

    SocketAdapter.prototype.find = function (resource, id, options) {
      return new Promise(function (resolve) {
        Sockets.emit('jsData', {
          method: 'find',
          //TODO rename models with pool or set basePath for adapter or leave as it is now
          resource: 'dev/' + resource.name,
          options: options
        });

        Sockets.on('eventFromServer', function (data) {
          resolve(data);
        })
      })
    };

    SocketAdapter.prototype.create = function (resource, attrs) {
      throw new Error('Not implemented yet!!', attrs);
    };

    SocketAdapter.prototype.update = function (resource, id, attrs) {
      throw new Error('Not implemented yet!!', attrs);
    };

    SocketAdapter.prototype.destroy = function (resource, id, options) {
      throw new Error('Not implemented yet!!', options);
    };

    return SocketAdapter;
  });

}());
