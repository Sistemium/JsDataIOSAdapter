'use strict';

(function () {

  angular.module('Models').run(function (Schema, PhotoHelper) {

    const config = PhotoHelper.setupModel({

      name: 'OutletPhoto',

      relations: {
        hasOne: {
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          }
        }
      },

      methods: {
        getImageSrc: function (size) {
          return PhotoHelper.getImageSrc(this, size);
        }
      }

    });

    Schema.register (config);

  });

})();
