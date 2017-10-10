'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'UserNewsMessage',

      relations: {
        hasOne: {
          Account: {
            localField: 'authorAccount',
            localKey: 'authorId'
          }
        }
      }

    });

  });

})();
