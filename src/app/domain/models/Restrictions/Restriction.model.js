'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Restriction',

      relations: {
        hasMany: {
          // RestrictionArticle: {
          //   localField: 'restrictionArticles',
          //   foreignKey: 'restrictionId'
          // },
          // SalesmanOutletRestriction: {
          //   localField: 'salesmanOutletRestrictions',
          //   foreignKey: 'restrictionId'
          // }
        }
      }

    });

  });

})();
