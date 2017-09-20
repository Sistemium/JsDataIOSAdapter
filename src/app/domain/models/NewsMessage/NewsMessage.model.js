'use strict';

(function () {

  angular.module('Models').run(function (Schema, Auth) {

    Schema.register({

      name: 'NewsMessage',

      relations: {
        hasOne: {
          UserNewsMessage: {
            localField: 'userNewsMessage',
            foreignKey: 'newsMessageId'
          },
          Account: {
            localField: 'authorAccount',
            localKey: 'authorId'
          }
        }
      },

      computed: {
        rating: ['ratingsTotal', 'ratingsCount', commonRating]
      },

      methods: {
        isAuthor
      }

    });

    function  commonRating(ratingsTotal, ratingsCount) {
      return ratingsCount ? (ratingsTotal / ratingsCount).toFixed(1) : null;
    }

    function isAuthor() {
      return Auth.authId() === this.authId;
    }

  });

})();
