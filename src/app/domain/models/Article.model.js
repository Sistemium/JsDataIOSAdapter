'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    const re = /защищ[^ .]*[ .]*наим[^ .]*[ .]*места проис[^ ]*|защ[^ .]*[ .]*геогр[^ .]*[ .]*указ[^ ]*|геогр[^ .]*[ .]*указ[^ ]*|геогр[^ .]*[ .]*защ[^ ]* наим[^ ]*|геог[^ .]*[ .]*наим[^ ]*|защищ[^ .]*[ .]*наим[^ ]*/i;

    const tagRegs = [
      ['red', 'красное', /красн\.|красное|кр\.(?![^\d][\d]+)/i],
      ['white', 'белое', /бел\.|белое/i],
      ['semiDry', 'п/сух', /полусухое|п\/сух\./ig],
      ['semiSweet', 'п/сл', /полусладкое|п\/сл.|п\/сл([ ])/ig],
      ['dry', 'сухое', /сухое|сух\./i],
      ['sweet', 'сладкое', /сладк[^ ,]*|сладкое|сл\./i],
      ['brut', 'брют', /брют/i],
      ['gift', 'п/у', /подар[^ .]*|под[^ .]*[ .]{1,2}упа[^ .)]*|в п\/у[^ .)]*|п\/у[^ .)]*/i]
    ];

    Schema.register({

      name: 'Article',

      relations: {

        belongsTo: {
          ArticleGroup: {
            localField: 'ArticleGroup',
            localKey: 'articleGroupId'
          }
        },

        hasOne: {
          Stock: {
            localField: 'stock',
            foreignKey: 'articleId'
          },
          ArticlePicture: {
            localField: 'avatar',
            localKey: 'avatarPictureId'
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

      watchChanges: false,
      resetHistoryOnInject: false,

      instanceEvents: false,
      notify: false,

      computed: {
        tags: ['name', tagger],
        preName: ['name', function (name) {

          let m = name.match(/[^"]+/);
          let res = (m && m.length) ? _.trim(m[0]) : null;

          res = _.replace(res, re, 'ЗНМП');

          _.each(tagRegs, cfg => {
            res = _.replace(res, cfg[2], '');
          });

          return _.trim(res);

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
          m = _.trim(m.replace(/^,[^ ]*/, ''));
          let res = m.replace(/\(.*[xх]+[ ]*[0-9]+[ ]*\)/, '');
          res = _.replace(res, re, 'ЗНМП');

          _.each(tagRegs, cfg => {
            res = _.replace(res, cfg[2], '');
          });

          return _.trim(res);
        }],
        sameId: ['articleSame', 'id', function (articleSame, id) {
          return articleSame || id;
        }],
        pcsLabel: ['pieceVolume', function (pieceVolume) {
          return pieceVolume ? 'б' : 'шт';
        }]
      },

      // fieldTypes: {
      // packageRel: 'int',
      // pieceVolume: 'decimal'
      // },

      methods: {

        boxVolume: function (volume) {
          return volume / this.packageRel;
        },

        boxPcs: function (volume) {

          var rel = this.packageRel;
          var box = rel > 1 ? Math.floor(volume / rel) : 0;
          var pcs = volume - box * rel;
          let half = pcs * 2 === rel;

          return {
            box: box,
            pcs: pcs,
            full: (box || half ? `${box || ''}${half && '½' || ''} к` : '')
            + (box && pcs && !half && ' ' || '')
            + (pcs && !half ? `${pcs} ${this.pcsLabel}` : '')
          }

        }

      }

    });

    function tagger(name) {

      let res = _.map(tagRegs, cfg => {
        if (cfg[2].test(name)) {
          name = _.replace(name, cfg[2], '');
          return {
            code: cfg[0],
            label: cfg[1]
          };
        }
      });

      return _.filter(res);

    }

  });

})();
