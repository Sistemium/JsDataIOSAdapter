'use strict';

(function () {

  function SalesTerritoryController(Schema, $q, $state, SalesmanAuth, $scope) {

    var vm = this;

    _.assign(vm, {

      refresh,
      partnerClick,
      outletClick,
      addOutletClick,
      hashClick,

      filter: (partner) => !vm.currentHash || partner.shortName.match(new RegExp('^' + vm.currentHash, 'i'))

    });

    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');
    var SM = Schema.model('Salesman');
    var stateFilter = {};

    var rootState = _.first($state.current.name.match(/sales\.[^.]+/)) || 'sales.territory';

    vm.salesman = SalesmanAuth.getCurrentUser();

    if (vm.salesman) {
      stateFilter.salesmanId = vm.salesman.id;
    }

    Partner.bindAll(false, $scope, 'vm.partners', setupHash);

    vm.refresh();

    $scope.$on('rootClick', () => $state.go(rootState));

    $scope.$on('$stateChangeSuccess', (e, to) =>  vm.hideHashes = !/.*territory$/.test(to.name));

    function refresh() {

      vm.busy = $q.all([
        Partner.findAll(false, {bypassCache: true}),
        SM.findAll(),
        Outlet.findAll(stateFilter, {limit: 1000, bypassCache: true})
      ]);
    }

    function partnerClick(partner) {
      $state.go('.partner', {id: partner.id});
    }

    function outletClick(outlet) {
      if (rootState == 'sales.visits') {
        return $state.go(`${rootState}.visitCreate`, {id: outlet.id});
      }
      $state.go('.outlet', {id: outlet.id});
    }

    function addOutletClick() {
      $state.go('.addOutlet');
    }

    function hashButtons(hash) {
      var hashRe = new RegExp('^' + _.escapeRegExp(hash), 'i');

      var partners = _.filter(vm.partners, (p) => hashRe.test(p.shortName));

      var grouped = _.groupBy(partners, (p) => _.upperFirst(p.shortName.substr(0, hash.length + 1).toLowerCase()));

      return _.orderBy(_.map(grouped, (val, key) => {
        var b = {
          label: key,
          match: new RegExp('^' + _.escapeRegExp(key), 'i')
        };
        if (val.length > 1 && !hash) {
          b.buttons = hashButtons(key);
        }
        return b;
      }), 'label');

    }

    function setupHash() {
      vm.hashButtons = hashButtons('');
      //console.log(vm.hashButtons);
    }

    function hashClick(btn) {

      var label = btn.label || '';

      if (vm.currentHash === label) {
        vm.currentHash = label.substr(0, label.length - 1);
      } else {
        vm.currentHash = label;
      }

    }

  }

  angular.module('webPage')
    .controller('SalesTerritoryController', SalesTerritoryController)
  ;

}());
