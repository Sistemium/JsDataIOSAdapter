'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    function getRating() {

      var rating = this.ratingsTotal / this.ratingsCount;

      if (rating) {
        return rating % 1 != 0 ? rating.toFixed(1) : rating
      }


    }

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
        rating: ['news', getRating]
      },

      methods: {}

    });

  });

})();
