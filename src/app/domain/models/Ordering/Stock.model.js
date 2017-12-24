'use strict';

(function () {

  angular.module('Models').run(function (Schema, $q) {

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

      meta: {
        data: null,
        indexByArticleId: {},
        cachedFindAll,
        getAll,
        getByArticleId,
        loadArticle
      }

    });

    function getByArticleId(articleId) {
      return Stock.meta.indexByArticleId[articleId]
    }

    function getAll() {
      return Stock.meta.data;
    }

    function loadArticle(article) {

      const articleId = article.id;

      if (Stock.meta.indexByArticleId[articleId]) {
        return Stock.meta.indexByArticleId[articleId];
      }

      return Stock.findAll({articleId}, {afterFindAll, cacheResponse: false});

      function afterFindAll(options, data) {

        let item = _.first(data) || {};

        let {indexByArticleId} = Stock.meta;

        indexByArticleId[articleId] = item;
        item.article = article;

        Stock.meta.data.push(item);

        return null;

      }
    }

    function cachedFindAll(filter, options) {

      if (Stock.meta.data) {
        return $q.resolve(Stock.meta.data);
      }

      const {Article} = Schema.models();

      return Stock.findAll(filter, _.assign({afterFindAll, cacheResponse: false}, options));

      function afterFindAll(options, data) {

        let indexByArticleId = {};

        _.each(data, item => {
          let {articleId} = item;
          indexByArticleId[articleId] = item;
          item.article = Article.get(articleId);
        });

        Stock.meta.data = data;
        Stock.meta.indexByArticleId = indexByArticleId;

        return [];

      }

    }

  });

})();
