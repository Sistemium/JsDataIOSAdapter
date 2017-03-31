'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ContractArticle',

      relations: {
        hasOne: {
          // Contract: {
          //   localField: 'contract',
          //   localKey: 'contractId'
          // },
          // Article: {
          //   localField: 'article',
          //   localKey: 'articleId'
          // }
        }
      },

      watchChanges: false

    });

  });

})();
