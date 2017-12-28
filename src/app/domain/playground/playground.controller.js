(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('PlayGroundController', PlayGroundController);

  function PlayGroundController(Schema, DEBUG, moment) {

    const vm = this;
    const {Price} = Schema.models();

    vm.started = moment();

    DEBUG('PlayGroundController started', vm.started);

    Price
      .findAll({}, {afterFindAll, bypassCache: true})
      .then(() => vm.finished = moment().diff(vm.started))
      .catch(err => vm.err = err);

    function afterFindAll(options, data) {
      DEBUG('PlayGroundController afterFindAll', options, data);
      return [];
      // return data;
    }

  }

})();
