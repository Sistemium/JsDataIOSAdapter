'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    Schema.register({

      name: 'Article',

      relations: {
        belongsTo: {
          ArticleGroup: {
            localField: 'ArticleGroup',
            localKey: 'articleGroup'
          }
        },
        hasOne: {
          Stock: {
            localField: 'stock',
            foreignKey: 'articleId'
          }
        },

        hasMany: {
          StockBatch: {
            localField: 'stockBatches',
            foreignKey: 'article'
          },
          SaleOrderPosition: {
            localField: 'saleOrders',
            foreignKey: 'articleId'
          }
        }
      },

      computed: {
        preName: ['name', function (name) {
          var m = name.match(/[^"]+/);
          return (m && m.length) ? _.trim(m[0]) : null;
        }],
        firstName: ['name', function (name) {
          var m = name.match(/"[^"]+"/);
          return (m && m.length) ? m[0] : null;
        }],
        category: ['name', function (name) {
          var m = name.match(/^[^ ]*/);
          return (m && m.length) ? m[0].replace(/[^а-яa-z]/ig, ' ') : null;
        }],
        factory: ['name', function (name) {
          var m = name.match(/[ ][^ ]+[ ]/);
          return (m && m.length) ? m[0].replace(/[^а-яa-z]/ig, ' ') : null;
        }],
        lastName: ['name', 'firstName', 'preName', function (name, firstName) {
          var m = name.match(/"[^"]+" (.+)(?=,[ \D])/);
          m = (m && m.length > 1) ? m[1] : '';
          if (!m && firstName) {
           m = _.trim(name.substr(name.lastIndexOf(firstName) + firstName.length))
          }
          m = _.trim(m.replace(/^,[^ ]*/,''));
          return m.replace(/\(.*[xх]+[ ]*[0-9]+[ ]*\)/, '');
        }],
        sameId: ['articleSame', 'id', function (articleSame, id) {
          return articleSame || id;
        }]
      },

      fieldTypes: {
        packageRel: 'int',
        pieceVolume: 'decimal'
      },

      methods: {

        boxVolume: function (volume) {
          return volume / this.packageRel;
        },

        boxPcs: function (volume) {

          var rel = this.packageRel;
          var box = Math.floor(volume / rel) || 0;
          var pcs = volume - box * rel;

          return {
            box: box,
            pcs: pcs,
            full: (box ? box + ' к' : '')
            + (box && pcs && ' ' || '')
            + (pcs ? pcs + ' б' : '')
          }

        }

      }

    });

  });

})();
