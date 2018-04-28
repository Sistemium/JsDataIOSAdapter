(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('PlayGroundController', PlayGroundController);

  function PlayGroundController(Schema, DEBUG, moment, $q) {

    const vm = this;
    const {Price, Article, ArticleGroup} = Schema.models();

    let lastFinished = vm.started = moment();
    vm.finished = {};
    vm.samples = [];

    DEBUG('PlayGroundController started', vm.started);

    $q.all([
      Price.findAll({}, options({afterFindAll}))

        .then(() => {
          vm.finished['Price'] = moment().diff(lastFinished);
          // lastFinished = moment();
        }),
      Article.cachedFindAll({}, options({afterFindAll}))
        .then(() => {
          vm.finished['Article'] = moment().diff(lastFinished);
          // lastFinished = moment();
        }),
      ArticleGroup.cachedFindAll({}, options())
        .then(() => {
          vm.finished['ArticleGroup'] = moment().diff(lastFinished);
          // lastFinished = moment();
        })
    ])
      .then(() => {
        vm.finished.total = moment().diff(vm.started);
      })
      .catch(err => vm.err = err);

    function afterFindAll(options, data) {
      DEBUG('PlayGroundController afterFindAll', options, data);
      vm.samples.push(data[0]);
      return [];
      // return data;
    }

    function options(o) {
      return _.assign({limit: 10000, bypassCache: true}, o);
    }

  }

})();
