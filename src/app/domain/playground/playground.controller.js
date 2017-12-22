(function () {
  'use strict';

  angular
    .module('webPage')
    .controller('PlayGroundController', PlayGroundController);

  function PlayGroundController(Schema) {

    const vm = this;
    const {Commentary} = Schema.models();

    Commentary
      .groupBy({}, ['owner1Xid'])
      .then(data => vm.data = data)
      .catch(err => vm.err = err);

  }

})();
