'use strict';

(function () {

  var basePath = window.localStorage.getItem('JSData.BasePath')
    || location.protocol === 'https:' && '/api/dev/'
    || 'https://api.sistemium.com/v4d/dev/'
  ;

  angular.module('Models', ['sistemium'])

    .config(function (DSHttpAdapterProvider) {
      angular.extend(DSHttpAdapterProvider.defaults, {
        basePath: basePath
      });
    })

    .service('Schema', Schema)

    .service('models', function (Schema) {
      return Schema.models();
    })

    .run (registerAdapters)
  ;

  function Schema (saSchema,$http) {
    return saSchema({
      getCount: function (resource,params) {

        return $http

          .get(
            basePath + '/' + resource.endpoint,
            {
              params: angular.extend({
                'agg:': 'count'
              }, params || {})
            }
          )

          .then(function (res) {
            return parseInt(res.headers('x-aggregate-count'));
          })
          ;

      }
    });
  }

  function registerAdapters ($window, DS, IosAdapter, SocketAdapter, Schema) {

    if ($window.webkit) {
      DS.registerAdapter('ios', new IosAdapter (Schema), {default: true});
    } else {
      DS.registerAdapter('socket', new SocketAdapter(), {default: true});
    }

  }

}());
