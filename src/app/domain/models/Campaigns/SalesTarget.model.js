'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'SalesTarget',

      relations: {

        belongsTo: {
          SalesTargetGroup: {
            localField: 'targetGroup',
            localKey: 'targetGroupId'
          }
        },

      },

      meta: {}

    });

  });

})();
