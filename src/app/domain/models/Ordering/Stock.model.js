'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

    const meta = {

      data: null,
      indexByArticleId: {},

      lastOffset: '*',

      cachedFindAll,
      getAll,
      getByArticleId,
      loadArticle,
      inject,
      findAllUpdates

    };

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

      if (meta.indexByArticleId[articleId]) {
        return meta.indexByArticleId[articleId];
      }

      return Stock.findAll({articleId}, {afterFindAll, cacheResponse: false});

      function afterFindAll(options, data) {

        let item = _.first(data) || {};

        let {indexByArticleId} = meta;

        indexByArticleId[articleId] = item;
        item.article = article;

        meta.data.push(item);

        return null;

      }
    }

    function findAllUpdates() {
      return cachedFindAll({}, {mergeUpdates: true});
    }

    function cachedFindAll(filter, options = {}) {

      if (meta.data && !options.mergeUpdates) {
        return $q.resolve(meta.data);
      }

      let cacheOptions = _.assign({
        afterFindAll,
        cacheResponse: false,
        bypassCache: true,
        limit: 10000,
        offset: meta.lastOffset
      }, options);

      let result = [];

      return Stock.findAll(filter, cacheOptions)
        .then(() => result);

      function afterFindAll(options, data) {

        const {Article} = Schema.models();
        let maxTs = _.maxBy(data, 'ts');

        meta.lastOffset = `1-${moment(maxTs.ts).format('YYYYMMDDHHmmssSSS')}-0`;

        console.warn('maxTs', maxTs, meta.lastOffset);

        let {indexByArticleId} = meta;

        if (options.mergeUpdates && meta.data) {

          _.each(data, inject);

        } else {

          _.each(data, item => {

            let {articleId} = item;
            indexByArticleId[articleId] = item;
            item.article = Article.get(articleId);

          });

          meta.data = data;

        }

        result = data;

        return [];

      }

    }

  });

})();
