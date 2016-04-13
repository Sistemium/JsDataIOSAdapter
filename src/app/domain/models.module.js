'use strict';

(function () {

  //inject only models module
  angular.module('Models', ['sistemium'])

    .config(function (DSHttpAdapterProvider) {
      var basePath = window.localStorage.getItem('JSData.BasePath')
        || location.protocol === 'https:' && '/api/dev/'
        || 'https://api.sistemium.com/v4d/dev/';
      angular.extend(DSHttpAdapterProvider.defaults, {
        basePath: basePath
      });
    })

    .service('models', function (Schema) {

      return Schema.models();

    })

    .service('Schema', function(saSchema) {
      return saSchema;
    })

    .run(function($window, DS, IosAdapter, SocketAdapter, Schema){

      if ($window.webkit) {
        DS.registerAdapter('ios', new IosAdapter (Schema), {default: true});
      } else {
        DS.registerAdapter('socket', new SocketAdapter(), {default: true});
      }

    })

  ;

}());
