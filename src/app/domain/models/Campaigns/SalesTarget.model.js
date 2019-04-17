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

      meta: {},

      methods: {
        isFulfilled(shipments) {
          const { articleIds = [], cnt: targetCnt } = this;
          const byArticleId = _.groupBy(shipments, 'articleId');
          const matching = _.filter(articleIds, articleId => byArticleId[articleId]);
          return targetCnt <= matching.length;
        },
      },

    });

  });

})();
