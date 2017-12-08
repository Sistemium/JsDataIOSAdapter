'use strict';

(function () {

  angular.module('Models').run(function (Schema, Auth, moment) {

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
        },

        hasMany: {
          NewsMessagePicture: {
            localField: 'pictures',
            foreignKey: 'newsMessageId'
          }
        }

      },

      computed: {
        rating: ['ratingsTotal', 'ratingsCount', commonRating]
      },

      methods: {
        isAuthor,
        isUnrated
      },

      meta: {
        ratingTitles: ['Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'],
        filterActual
      }

    });

    function isUnrated() {
      return !this.isAuthor() && !_.get(this, 'userNewsMessage.rating');
    }

    function  commonRating(ratingsTotal, ratingsCount) {
      return ratingsCount ? (ratingsTotal / ratingsCount).toFixed(1) : null;
    }

    function isAuthor() {
      return Auth.authId() === this.authId;
    }

    function filterActual(filter) {

      let today = moment().format();

      return _.assign({
        where: {
          dateB: {
            '<=': today
          },
          dateE: {
            '>=': today
          }
        }
      }, filter);

    }

  });

})();
