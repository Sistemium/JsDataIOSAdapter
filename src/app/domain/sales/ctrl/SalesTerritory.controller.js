'use strict';

(function () {

  function SalesTerritoryController(Schema, Helpers, $state, SalesmanAuth, $scope) {

    const {Outlet, Partner} = Schema.models();
    const {saMedia, saControllerHelper} = Helpers;

    let vm = saControllerHelper.setup(this, $scope);

    let rootState = _.first($state.current.name.match(/sales\.[^.]+/)) || 'sales.territory';

    vm.use({

      refresh,
      partnerClick,
      outletClick,
      addOutletClick,
      hashClick,
      onStateChange,
      rowHeight,

      filter: (partner) => !vm.currentHash || partner.shortName.match(new RegExp('^' + vm.currentHash, 'i'))

    });

    if (rootState !== 'sales.territory') {
      delete vm.addOutletClick;
    }

    SalesmanAuth.watchCurrent($scope, refresh);

    Partner.bindAll(false, $scope, 'vm.partners', setupHash);

    $scope.$on('rootClick', () => $state.go(rootState));

    $scope.$watch(
      () => saMedia.xsWidth,
      (newValue, oldValue) => newValue != oldValue && $scope.$broadcast('vsRepeatTrigger')
    );

    /*
     Functions
     */

    function onStateChange(to) {
      _.assign(vm, {
        hideHashes: !/.*territory$/.test(to.name),
        partnerLinkClass: {
          disabled: visitsIsRootState()
        }
      });
    }

    function visitsIsRootState() {
      return (rootState == 'sales.visits');
    }

    function rowHeight(partner) {
      let xsMargin = saMedia.xsWidth ? 21 : 0;
      return 39 + partner.outlets.length * 29 + 8 + 17 - xsMargin;
    }

    function refresh(salesman) {

      let filter = SalesmanAuth.makeFilter();
      vm.salesman = salesman;

      vm.setBusy (
        Outlet.findAll(filter, {limit: 1000})
          .then(outlets => Partner.findAll(filter).then(()=>outlets))
      )
        .then(outlets => {
          if (!vm.salesman) return;
          let filter = {
            where: {
              id: {
                notIn: _.map(outlets, 'id')
              }
            }
          };
          Outlet.ejectAll(filter);
          filter.where.id.notIn = _.uniq(_.map(outlets, 'partnerId'));
          Partner.ejectAll(filter);
        });

      // TODO: scroll to top after refresh

    }

    function partnerClick(partner) {
      $state.go('.partner', {id: partner.id});
    }

    function outletClick(outlet) {
      if (visitsIsRootState()) {
        return $state.go(`${rootState}.outlet.visitCreate`, {id: outlet.id});
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
