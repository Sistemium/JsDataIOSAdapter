'use strict';

(function () {

  angular.module('Models', ['js-data'])

    .config(function (DSProvider, DSHttpAdapterProvider) {

      var basePath = window.localStorage.getItem('JSData.BasePath')
        || 'https://api.sistemium.com/v4d/dev/';

      angular.extend(DSHttpAdapterProvider.defaults, {

        basePath: basePath,

        httpConfig: {
          headers: {
            'X-Return-Post': 'true',
            'authorization': window.localStorage.getItem('authorization')
          }
        },

        queryTransform: function queryTransform(resourceConfig, params) {

          var res = {};

          if (params.offset) {
            res['x-start-page:'] = Math.ceil(params.offset / params.limit);
          }
          if (params.limit) {
            res['x-page-size:'] = params.limit;
          }

          delete params.limit;
          delete params.offset;

          return angular.extend(res, params);

        }

      });

    })

    .service('models', function (Schema) {

      return Schema.models();

    })

}());
