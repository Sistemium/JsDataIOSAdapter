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

    });

}());
