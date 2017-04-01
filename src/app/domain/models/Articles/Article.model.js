'use strict';

(function () {

  angular.module('Models').run(function (Schema) {

    const znmpRe = new RegExp([
      'защ[^ .]*[ .]*наи[^ .]*[ .]+мест[^ .]*[ .]+проис[^ ]*',
      'защ[^ .]*[ .]*гео[^ .]*[ .]+указ[^ .]*',
      'защ[^ .]*[ .]*гео[^ .]*[ .]+наим[^ .]*',
      'защ[^ .]*[ .]*наи[^ ]*',
      'гео[^ .]*[ .]*защ[^ .]*[ .]+наим[^ ]*',
      'гео[^ .]*[ .]*ука[^ ]*',
      'гео[^ .]*[ .]*наи[^ ]*'
    ].join('[.,]*|'));

    const tagRegs = [
      ['sparkling', 'игристое', /игристое/i],
      ['rose', 'розовое', /розовое/i],
      ['red', 'красное', /красн\.|красное|кр\.(?![^\d][\d]+)/i],
      ['white', 'белое', /бел\.|белое/i],
      ['semiDry', 'п/сух', /полусухое|п\/сух\.?/ig],
      ['semiSweet', 'п/сл', /полусладкое|п\/сл[,.]+|п\/сл(?=[ ]|$)/ig],
      ['dry', 'сухое', /сухое|сух[.,]+|[ .,]+сух(?=[ ]|$)/i],
      ['sweet', 'сладкое', /[ ]+сладк[^ ,]*|сладкое|сл\./i],
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
        preName: ['name', preNameFn],
        firstName: ['name', firstNameFn],

        category: ['name', function (name) {
          let m = name.match(/^[^ ]*/);
          return (m && m.length) ? m[0].replace(/[^а-яa-z]/ig, ' ') : null;
        }],

        factory: ['name', function (name) {
          let m = name.match(/[ ][^ ]+[ ]/);
          return (m && m.length) ? m[0].replace(/[^а-яa-z]/ig, ' ') : null;
        }],

        lastName: ['name', 'firstName', 'preName', lastNameFn],

        sameId: ['articleSame', 'id', function (articleSame, id) {
          return articleSame || id;
        }],

        pcsLabel: ['pieceVolume', function (pieceVolume) {
          return pieceVolume ? 'б' : 'шт';
        }]

      },

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

    function lastNameFn(name, firstName, preName) {

      name = rmTags(name);

      name = _.replace(name, preName, '');
      name = _.trim(_.replace(name, firstName, ''));

      let re = new RegExp(`(.+)(?=,[ \D])`);
      let m = name.match(re);

      let res = (m && m.length > 1) ? m[1] : name;

      if (!res && firstName) {
        res = _.trim(name.substr(name.lastIndexOf(firstName) + firstName.length))
      }

      res = _.trim(res.replace(/^,[^ ]*/, ''));

      let pieceVolumeRe = /([ ,]+\d[.,]\d+)/g;
      res = _.trim(_.replace(res, pieceVolumeRe, ''));

      let packageRe = /\(.*[x]+[ ]*[0-9]+[ ]*\)/;

      if (packageRe.test(res)) {
        res = m.replace(packageRe, '');
      }

      return _.trim(res);

    }

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

    function rmTags(res) {

      res = _.replace(res, znmpRe, 'ЗНМП ');

      _.each(tagRegs, cfg => {
        res = _.replace(res, cfg[2], ' ');
      });

      return _.trim(_.replace(res, /[ ]{2,}/g, ' '));

    }

    function preNameFn(name) {

      let m = name.match(/[^"]+/);
      let res = /"/.test(name) ? _.first(m) : _.first(name.match(/[^ ]+/));

      return rmTags(res);

    }

    const wordsRe = /[a-zA-Zа-яА-ЯёЁ\/-]{2,}/g;
    const delims = ['де', 'делла', 'оф'];

    function firstNameFn(name) {

      let m = name.match(/"[^"]+"/);
      let res = _.first(m);

      if (!res) {
        let words = _.words(name, wordsRe);
        let stop = false;
        let found = false;
        res = _.filter(words, (word, idx) => {

          let upperFirst = word.match(/^[А-ЯA-Z].+/) || delims.indexOf(word) >= 0 && word;

          found = found || idx > 0 && upperFirst;

          stop = stop || found && !upperFirst;

          return idx > 0 && !stop && upperFirst;

        }).join(' ');
      }

      return res;

    }

  });

})();