angular.module('core.services')
  .filter('boxPcs', function($filter) {

    var boxesFilter = $filter ('boxes');
    var bottlesFilter = $filter ('bottles');

    return function boxPcsFilter (boxPcs) {

      var res = [];

      if (boxPcs.box) {
        res.push (boxesFilter (boxPcs.box));
      }
      if (boxPcs.pcs) {
        res.push (bottlesFilter (boxPcs.pcs));
      }

      return res.join (' ');

    };
  });
