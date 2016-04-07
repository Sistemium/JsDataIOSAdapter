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
      return Sockets.emitQ('jsData', {
        method: 'findAll',
        //TODO rename models with pool or set basePath for adapter or leave as it is now
        resource: 'dev/' + resource.name,
        params: params,
        options: options
      });
    };

    SocketAdapter.prototype.find = function (resource, id, options) {
      return Sockets.emitQ('jsData', {
        method: 'find',
        //TODO rename models with pool or set basePath for adapter or leave as it is now
        resource: 'dev/' + resource.name,
        id: id,
        options: options
      });
    };

    SocketAdapter.prototype.create = function (resource, attrs) {
      return Sockets.emitQ('jsData', {
        method: 'create',
        resource: 'dev/' + resource.name,
        attrs: attrs
      });
    };

    SocketAdapter.prototype.update = function (resource, id, attrs) {
      return Sockets.emitQ('jsData', {
        method: 'update',
        resource: 'dev/' + resource.name,
        id: id,
        attrs: attrs
      });
    };

    SocketAdapter.prototype.destroy = function (resource, id, options) {
      var q = Sockets.emitQ('jsData', {
        method: 'destroy',
        resource: 'dev/' + resource.name,
        id: id,
        options: options
      });

      q.catch (function(err){
        if (err && err.error === 404) {
          resource.eject(id);
        }
      });

      return q;
    };

    return SocketAdapter;
  });

}());
