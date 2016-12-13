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

      watchChanges: false,

      useClass: false,
      instanceEvents: false,
      notify: false,

      meta: {
        setupCaches
      },

      computed: {
        ancestorsCache: ['id', 'articleGroupId', setACache],
        descendantsCache: ['id', 'articleGroupId', setDCache]
      },

      methods: {

        ancestors,
        descendants,

        hasDescendants: function (ids) {
          return _.find(this.descendantsCache, item => ids[item]);
        }

      }

    });

    let cacheA = {};
    let cacheD = {};

    function descendants() {
      return model.getAll(this.descendantsCache);
    }

    function ancestors(articleGroup) {

      articleGroup = articleGroup || this;

      let res = [];

      if (articleGroup.articleGroupId) {
        res.push(articleGroup.articleGroup);
        Array.prototype.push.apply(res, ancestors(articleGroup.articleGroup));
      }

      return res;

    }

    function setCache(store, id, articleGroupId) {
      let cache = store[id];
      if (!cache) {
        cache = store[id] = []
      }
      articleGroupId && cache.indexOf(articleGroupId) === -1 && cache.push(articleGroupId);
      return cache;
    }

    function setACache(id) {

      let ownCache = setCache(cacheA, id);

      // setCache(cacheD, parent, id);
      //
      // _.each(cacheD[id], descendant => {
      //   setCache(cacheA, descendant, parent);
      //   setCache(cacheD, descendant, parent);
      // });
      // _.each(parent && cacheA[parent], ancestor => ancestor && setCaches(id, ancestor));

      return ownCache;

    }

    function setDCache(id) {

      let ownCache = setCache(cacheD, id);

      // let ancestors = cacheD[id] || parent && [parent];
      // _.each(ownCache, descendant => ownCache.push(descendant));
      // _.each(cacheA[id], ancestor => setDCache(id, ancestor));

      return ownCache;
    }

    function setupCaches() {
      let data = model.getAll();

      _.each(data, item => {
        _.each(item.ancestors(), ancestor => {
          setCache(cacheA, item.id, ancestor.id);
          setCache(cacheD, ancestor.id, item.id);
        });

      });

    }

  });

})();
