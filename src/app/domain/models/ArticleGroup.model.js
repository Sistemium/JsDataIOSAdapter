'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    let model = Schema.register({

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

      meta: {},

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
          let id = this.id;
          return _.filter(model.getAll(), item => _.map(item.ancestors(), 'id').indexOf(id) > -1);
        },

        hasDescendants: function (ids) {
          return _.find(this.descendants(), item => ids[item.id]);
        }

      }

    });

  });

})();
