'use strict';

(function () {

  angular.module('Models').run(function (Schema, $filter, DomainOption) {

    const cleanName = $filter('cleanName');

    const ArticleGroup = Schema.register({

      name: 'ArticleGroup',

      relations: {
        hasMany: {
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
      resetHistoryOnInject: false,

      instanceEvents: false,
      notify: false,

      meta: {
        stmRoot
      },

      computed: {
        displayName: ['name', cleanName],
        ancestorsCache: ['id', 'articleGroupId', setACache],
        descendantsCache: ['id', 'articleGroupId', setDCache],
        sortName: ['id', 'name', sortNameFn]
      },

      methods: {

        firstLevelAncestor,
        ancestors,
        descendants,
        filterDescendantArticles,

        hasDescendants: function (ids) {
          return _.find(this.descendantsCache, item => ids[item]);
        },

        ancestorNames

      }

    });

    let cacheA = {};
    let cacheD = {};

    function sortNameFn(id, name) {
      return `${(id === DomainOption.stmArticleGroupId()) ? '!' : ''}${_.trim(name)}`.toLocaleLowerCase();
    }

    function stmRoot() {
      let id = DomainOption.stmArticleGroupId();
      return id && ArticleGroup.get(id);
    }

    function firstLevelAncestor() {
      let id = _.find(this.ancestors(), {articleGroupId: null});
      return id || null;
    }

    function descendants() {
      return ArticleGroup.getAll(this.descendantsCache);
    }

    function ancestors(articleGroup) {
      articleGroup = articleGroup || this;
      return ArticleGroup.getAll(articleGroup.ancestorsCache);
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

    function ancestorNames() {

      let parent = this.articleGroup;
      let names = (parent ? `${parent.ancestorNames()} / ` : '') + this.sortName;

      return names || '';

    }

    function setDCache(id) {
      return setCache(cacheD, id);
    }

    function filterDescendantArticles(positions) {

      let hash = {};

      hash[this.id] = true;

      _.each(this.descendantsCache, id => hash[id] = true);

      return _.filter(positions, position => {
        let {article = position} = position;
        return article && hash[article.articleGroupId];
      });

    }


  });

})();
