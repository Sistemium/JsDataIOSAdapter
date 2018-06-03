'use strict';

(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'ArticleBarCode',

      relations: {

        hasOne: {
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }

      },

      meta: {

        commonName(items) {

          const words = _.map(items, item => {
            return _.words(item.name, /[a-zA-Zа-яА-ЯёЁ\/]{2,}/g);
          });

          return _.intersection.apply(this, words).join(' ');

        },

      },

    });

  });

})();
