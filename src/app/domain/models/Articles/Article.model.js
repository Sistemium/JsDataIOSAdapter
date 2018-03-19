'use strict';

(function () {

  angular.module('Models').run((Schema, RelationLoader, ArticleTagRegs) => {

    const znmpRe = new RegExp([
      'защ[^ .]*[ .]*наи[^ .]*[ .]+мест[^ .]*[ .]+проис[^ ]*',
      'защ[^ .]*[ .]*гео[^ .]*[ .]+указ[^ .]*',
      'защ[^ .]*[ .]*гео[^ .]*[ .]+наим[^ .]*',
      'защ[^ .]*[ .]*наи[^ ]*',
      'гео[^ .]*[ .]*защ[^ .]*[ .]+наим[^ ]*',
      'гео[^ .]*[ .]*ука[^ ]*',
      'гео[^ .]*[ .]*наи[^ ]*'
    ].join('[.,]*|'));

    const tagRegs = ArticleTagRegs;

    let barCodeLoader = new RelationLoader('barCodes');

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
            foreignKey: 'articleId'
          },
          SaleOrderPosition: {
            localField: 'saleOrders',
            foreignKey: 'articleId'
          },
          ArticleBarCode: {
            localField: 'barCodes',
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
        preName: ['name', name => rmTags(preNameFn(name))],
        firstName: ['name', firstNameFn],

        category: ['name', function (name) {
          let m = name.match(/^[^ ]*/);
          return (m && m.length) ? m[0].replace(/[^а-яa-z]/ig, ' ') : null;
        }],

        factory: ['name', function (name) {
          let m = name.match(/[ ][^ ]+[ ]/);
          return (m && m.length) ? m[0].replace(/[^а-яa-z]/ig, ' ') : null;
        }],

        lastName: ['name', 'firstName', lastNameFn],
        secondName: ['name', 'tags', secondNameFn],

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

        boxPcs: function (volume, noHalves) {

          noHalves = noHalves || _.isUndefined(noHalves);

          let rel = this.packageRel;
          let box = rel > 1 ? Math.floor(volume / rel) : 0;
          let pcs = volume - box * rel;
          let half = pcs * 2 === rel && !noHalves;

          return {
            box: box,
            pcs: pcs,
            full: (box || half ? `${box || ''}${half && '½' || ''} к` : '')
            + (box && pcs && !half && ' ' || '')
            + (pcs && !half ? `${pcs} ${this.pcsLabel}` : '')
          }

        },

        barCodesLazy: function () {
          return barCodeLoader.lazyItems(this);
        }

      }

    });

    function secondNameFn(name, tags) {

      let primaryTag = _.find(tags, tag => tag.groupId !== 'other');

      return primaryTag && primaryTag.label || null;

    }
    
    function lastNameFn(name, firstName) {

      let preName = preNameFn(name);

      name = _.replace(name, preName, '');
      name = _.trim(_.replace(name, firstName, ''));

      name = rmTags(name);

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
            label: cfg[1],
            groupId: cfg[3]
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

      return res;

    }

    const wordsRe = /[a-zA-Zа-яА-ЯёЁ\/-]{2,}/g;
    const delims = ['де', 'делла', 'оф'];

    function firstNameFn(name) {

      let m = name.match(/("[^"]+")[^"]*$/);

      let res = _.last(m);

      res = _.replace(res, /" | "/, '"');

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
