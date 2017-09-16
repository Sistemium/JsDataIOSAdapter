'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'NewsMessage',

      relations: {
        hasOne: {
          UserNewsMessage: {
            localField: 'userNewsMessage',
            foreignKey: 'newsMessageId'
          }
        }
      },

      computed: {
        rating: ['ratingsTotal', 'ratingsCount', commonRating]
      },

      methods: {}

    });

    function  commonRating(ratingsTotal, ratingsCount) {
      return ratingsCount ? ratingsTotal / ratingsCount : null;
    }

  });

})();
