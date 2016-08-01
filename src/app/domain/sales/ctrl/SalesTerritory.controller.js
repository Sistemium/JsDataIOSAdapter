'use strict';

(function () {

  function SalesTerritoryController(Schema, $q, $state, SalesmanAuth, $scope) {

    var vm = this;
    var Outlet = Schema.model('Outlet');
    var Partner = Schema.model('Partner');
    var SM = Schema.model('Salesman');
    var stateFilter = {};

    vm.addOutletBtnLabel = '+';
    vm.showAddOutletButton = true;

    var rootState = 'sales.territory';

    vm.salesman = SalesmanAuth.getCurrentUser();

    if (vm.salesman) {
      stateFilter.salesmanId = vm.salesman.id;
    }

    function refresh() {

      vm.busy = $q.all([
        Partner.findAll()
          .then(function (res) {
            vm.partners = res;
          }),
        SM.findAll(),
        Outlet.findAll(stateFilter, {limit: 1000})
      ])
        .then(function (res) {
          vm.outlets = res[2];
          setupHash();
        });
    }

    function addOutletClick() {

      console.log('addOutletClick()');
      $state.go('.addOutlet');

    }

    function outletClick(outlet) {
      $state.go('.outlet',{id: outlet.id});
    }

    function hashButtons (hash) {
      var hashRe = new RegExp('^'+_.escapeRegExp(hash),'i');

      var partners = _.filter(vm.partners, function (p) {
        return hashRe.test(p.shortName);
      });

      var grouped = _.groupBy(partners, function (p) {
        return _.upperFirst(p.shortName.substr(0, hash.length + 1).toLowerCase());
      });

      return _.orderBy(_.map(grouped, function (val, key) {
        var b = {
          label: key,
          match: new RegExp('^'+_.escapeRegExp(key),'i')
        };
        if (val.length > 1 && !hash) {
          b.buttons = hashButtons(key);
        }
        return b;
      }), 'label');

    }

    function setupHash() {
      vm.hashButtons = hashButtons('');
      console.log (vm.hashButtons);
    }

    function hashClick(btn) {

      var label = btn.label || '';

      if (vm.currentHash === label) {
        vm.currentHash = label.substr(0,label.length - 1);
      } else {
        vm.currentHash = label;
      }

    }

    angular.extend(vm, {

      refresh: refresh,
      addOutletClick: addOutletClick,
      outletClick: outletClick,
      hashClick: hashClick,

      filter: function(partner) {
        return !vm.currentHash || partner.shortName.match(new RegExp('^'+vm.currentHash,'i'));
      }

    });

    vm.refresh();

    $scope.$on('rootClick', function(){
      $state.go('sales.territory');
    });

    $scope.$on('$stateChangeSuccess', function (e, to) {
      vm.hideHashes = (to.name !== rootState);
    });

  }

  angular.module('webPage')
    .controller('SalesTerritoryController', SalesTerritoryController)
  ;

}());
