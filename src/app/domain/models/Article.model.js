'use strict';

(function () {

    angular.module('Models').run(function (Schema) {

      Schema.register ({

        name: 'Article',

        relations: {
          belongsTo: {
            ArticleGroup: {
              localField: 'ArticleGroup',
              localKey: 'articleGroup'
            }
          },
          hasMany: {
            StockBatch: {
              localField: 'stockBatches',
              foreignKey: 'article'
            }
          }
        },

        computed: {
          firstName: ['name', function (name) {
            var m = name.match(/"[^"]+"/);
            return (m && m.length) ? m[0] : null;
          }],
          category: ['name', function (name) {
            var m = name.match(/^[^ ]*/);
            return (m && m.length) ? m[0].replace (/[^а-яa-z]/ig,' ') : null;
          }],
          factory: ['name', function (name) {
            var m = name.match(/[ ][^ ]+[ ]/);
            return (m && m.length) ? m[0].replace (/[^а-яa-z]/ig,' ') : null;
          }],
          lastName: ['name', function (name) {
            var m = name.match(/"[^"]+" ([^,]*)/);
            m = (m && m.length > 1) ? m[1] : '';
            return m.replace (/\(.*[xх]+[ ]*[0-9]+[ ]*\)/,'') ;
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
            var box = Math.floor (volume / rel) || 0;
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
