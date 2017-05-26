'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    //TODO: Rating's mean

    function processingLabel(news) {

      console.log(this);

      return 'aasa';
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
        rating: ['news', processingLabel]
      },

      methods: {

        // orderSubTotal: function () {
        //   return _.sumBy(this.positions, item =>
        //     item.count > 0 ? Math.round(100.0 * item.priceOrigin * item.count) / 100.0 : 0
        //   );
        // },
      }

    });

  });

})();
