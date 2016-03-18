'use strict';

(function () {

  angular.module('Models', ['js-data'])

    .config(function (DSProvider, DSHttpAdapterProvider) {

      angular.extend(DSProvider.defaults, {
        beforeInject: function (resource, instance) {
          if (!instance.id) {
            instance.id = uuid.v4();
          }
        },
        beforeCreate: function (resource, instance, cb) {
          if (!instance.id) {
            instance.id = uuid.v4();
          }
          cb(null, instance);
        }
      });

      var basePath = window.localStorage.getItem('JSData.BasePath')
        || location.protocol === 'https:' && '/api/dev/'
        || 'https://api.sistemium.com/v4d/dev/';

      angular.extend(DSHttpAdapterProvider.defaults, {

        basePath: basePath,

        httpConfig: {
          headers: {
            'X-Return-Post': 'true',
            'authorization': window.localStorage.getItem('authorization'),
            'X-Page-Size': 300
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
