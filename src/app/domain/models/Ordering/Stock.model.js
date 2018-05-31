'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q, IOS) {

    const meta = {

      data: null,
      indexByArticleId: {},
      toIndexByArticleId: {},

      lastOffset: '*',

      cachedFindAll,
      getAll,
      getByArticleId,
      loadArticle,
      inject,
      findAllUpdates,
      checkIndexes

    };

    const isIos = IOS.isIos();

    const Stock = Schema.register({

      name: 'Stock',

      relations: {
        hasOne: {
          Article: {
            localField: 'article',
            localKey: 'articleId'
          }
        }
      },

      watchChanges: false,
      resetHistoryOnInject: false,

      instanceEvents: false,
      notify: false,

      meta

    });

    function inject(item) {

      const {Article} = Schema.models();
      let {articleId} = item;

      meta.indexByArticleId[articleId] = item;

      let index = _.findIndex(meta.data, {articleId});

      if (index >= 0) {
        meta.data[index] = item;
      } else {
        meta.data.push(item);
      }

      item.article = item.article || Article.get(articleId);

      if (!item.article) {
        meta.toIndexByArticleId[articleId] = item;
      }

      return item;

    }

    function getByArticleId(articleId) {
      return meta.indexByArticleId[articleId]
    }

    function getAll() {
      return meta.data;
    }

    function loadArticle(article) {

      const articleId = article.id;
      const shortRes = meta.indexByArticleId[articleId];

      if (shortRes) {
        delete meta.toIndexByArticleId[articleId];
        shortRes.article = article;
        return shortRes;
      }

      return Stock.findAll({articleId}, {afterFindAll, cacheResponse: false});

      function afterFindAll(options, data) {

        let item = _.first(data);

        if (item) {
          let {indexByArticleId} = meta;

          indexByArticleId[articleId] = item;
          item.article = article;

          meta.data.push(item);
        }

        return null;

      }
    }

    function findAllUpdates() {
      return cachedFindAll({}, {mergeUpdates: true});
    }

    function checkIndexes() {

      const {Article} = Schema.models();

      const {toIndexByArticleId} = meta;

      _.each(toIndexByArticleId, (item, articleId) => {

        let article = Article.get(articleId);

        if (article) {
          item.article = article;
          delete toIndexByArticleId[articleId];
        }

      });

      return Object.keys(toIndexByArticleId);

    }

    function cachedFindAll(filter, options = {}) {

      if (meta.data && !options.mergeUpdates) {
        return $q.resolve(meta.data);
      }

      let cacheOptions = _.assign({
        afterFindAll,
        cacheResponse: false,
        bypassCache: true,
        limit: 10000
      }, options);

      let where = {} || filter.where;

      if (isIos) {
        if (meta.lastOffset !== '*') {
          where.lts = { '>=': meta.lastOffset };
        }
      } else {
        cacheOptions.offset = meta.lastOffset;
      }

      let result = [];

      return Stock.findAll({ where }, cacheOptions)
        .then(() => result);

      function afterFindAll(options, data) {

        const {Article} = Schema.models();

        if (!data.length) {
          return;
        }

        if (!isIos) {
          let maxTs = _.maxBy(data, 'ts');
          meta.lastOffset = `1-${moment(maxTs.ts).format('YYYYMMDDHHmmssSSS')}-0`;
          // console.warn('maxTs', maxTs, meta.lastOffset);
        } else {
          let maxTs = _.maxBy(data, 'lts');
          meta.lastOffset = maxTs.lts;
        }

        let {indexByArticleId} = meta;

        if (options.mergeUpdates && meta.data) {

          _.each(data, inject);

        } else {

          _.each(data, item => {

            let {articleId} = item;

            indexByArticleId[articleId] = item;

            let article = Article.get(articleId);

            if (article) {
              item.article = article;
            } else {
              meta.toIndexByArticleId[articleId] = item;
            }

          });

          meta.data = data;

        }

        result = data;

        return [];

      }

    }

  });

})();
