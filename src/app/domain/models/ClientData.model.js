'use strict';

(function () {

  angular.module('jsd').run(['Schema', function (Schema) {

    Schema.register({

      name: 'ClientData',

      labels: {
        multiple: 'Данные оа Устройствах',
        single: 'Данные об устройстве'
      },

      relations: {
        hasOne: {
          WMSDevice: {
            localField: 'device',
            foreignKey: 'clientData'
          }
        }
      },

      computed: {
        locationServiceClass: ['locationServiceStatus', function(locationServiceStatus){
          switch (locationServiceStatus) {
            case 'authorizedAlways':
              return 'glyphicon glyphicon-map-marker green';
            case 'disabled':
            case 'denied':
              return 'glyphicon glyphicon-map-marker blue';
            case 'notDetermined':
              return 'glyphicon glyphicon-map-marker gray';
          }
        }],
        apnsClass: ['notificationTypes',function(notificationTypes){
          var cls = 'glyphicon glyphicon-bell ';
          if (notificationTypes === 'alert, badge, sound') {
            return cls + 'green';
          } else {
            return 'fa fa-bell-slash';
          }
        }]
      }

    });

  }]);

})();
