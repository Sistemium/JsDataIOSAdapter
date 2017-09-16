'use strict';

(() => {

  angular.module('Models').run((Schema, PhotoHelper) => {

    const config = PhotoHelper.setupModel({

      name: 'NewsMessagePicture',

      relations: {
        hasOne: {
          NewsMessage: {
            localField: 'newsMessage',
            localKey: 'newsMessageId'
          }
        }
      }

    });

    Schema.register(config);

  });

})();
