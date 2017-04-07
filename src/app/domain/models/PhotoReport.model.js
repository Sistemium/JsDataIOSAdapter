'use strict';

(function () {

  angular.module('Models').run(['Schema', function (Schema, PhotoHelper) {

    const config = PhotoHelper.setupModel({

      name: 'PhotoReport',

      labels: {
        multiple: 'Фотоотчёты',
        single: 'Фотоотчёт'
      },

      relations: {
        hasOne: {
          Campaign: {
            localField: 'campaign',
            localKey: 'campaignId'
          },
          Outlet: {
            localField: 'outlet',
            localKey: 'outletId'
          },
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId'
          }
        }
      }

    });

    Schema.register(config);


  }]);

})();
