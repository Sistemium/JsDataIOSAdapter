(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('PlayGroundController', PlayGroundController);

  function PlayGroundController(Schema, DEBUG, moment) {

    const vm = this;
    const {Price, Article, ArticleGroup} = Schema.models();

    let lastFinished = vm.started = moment();
    vm.finished = {};

    DEBUG('PlayGroundController started', vm.started);

    Price
      .findAll({}, options({afterFindAll}))
      .then(() => {
        vm.finished['Price'] = moment().diff(lastFinished);
        lastFinished = moment();
      })
      .then(() => Article.cachedFindAll({}, options({afterFindAll})))
      .then(() => {
        vm.finished['Article'] = moment().diff(lastFinished);
        lastFinished = moment();
      })
      .then(() => ArticleGroup.cachedFindAll({}, options()))
      .then(() => {
        vm.finished['ArticleGroup'] = moment().diff(lastFinished);
        lastFinished = moment();
      })
      .catch(err => vm.err = err);

    function afterFindAll(options, data) {
      DEBUG('PlayGroundController afterFindAll', options, data);
      return [];
      // return data;
    }

    function options(o) {
      return _.assign({limit: 10000, bypassCache: true}, o);
    }

  }

})();
