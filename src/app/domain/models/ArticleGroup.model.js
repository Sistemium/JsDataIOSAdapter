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
      return model.getAll(articleGroup.ancestorsCache);
    }

    function setCache(store, id, articleGroupId) {
      let cache = store[id];
      if (!cache) {
        cache = store[id] = []
      }
      articleGroupId && cache.indexOf(articleGroupId) === -1 && cache.push(articleGroupId);
      return cache;
    }

    function setACache(id, parent) {

      let ownCache = setCache(cacheA, id, parent);

      setCache(cacheD, parent, id);

      _.each(cacheA[parent], ancestor => {
        setCache(cacheA, id, ancestor);
        setCache(cacheD, ancestor, id);
      });

      _.each(cacheD[id], descendant => {
        setCache(cacheA, descendant, id);
        _.each(cacheA[id], ancestor => {
          setCache(cacheD, ancestor, descendant);
          setCache(cacheA, descendant, ancestor);
        });
      });

      return ownCache;

    }

    function setDCache(id) {
      return setCache(cacheD, id);
    }

  });

})();
