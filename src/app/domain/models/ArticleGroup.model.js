'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'ArticleGroup',

      relations: {
        hasMany: {
          Article: {
            localField: 'Articles',
            foreignKey: 'articleGroupId'
          },
          ArticleGroup: {
            localField: 'children',
            foreignKey: 'articleGroupId'
          }
        },
        hasOne: {
          ArticleGroup: {
            localField: 'articleGroup',
            localKey: 'articleGroupId'
          }
        }
      },

      meta: {
      },

      methods: {
        ancestors: function () {
          let res = [];

          if (this.articleGroupId) {
            res.push(this.articleGroup);
            Array.prototype.push.apply(res, this.articleGroup.ancestors());
          }

          return res;

        },
        descendants: function () {
          let res = this.children;

          _.each(res, item => {
            Array.prototype.push.apply(res, item.descendants());
          });

          return res;

        },
        hasDescendants: function (ids) {
          let children = this.children;

          if (_.find(children, item => ids[item.id])) return true;

          return _.find(children, item => item.hasDescendants(ids));

        },
        stockArticles: function (stockCache) {
          return _.get(stockCache[this.id], 'length');
        }
      }

    });

  });

})();
