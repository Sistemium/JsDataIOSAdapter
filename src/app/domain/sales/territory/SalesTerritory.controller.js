'use strict';

(function () {

  function SalesTerritoryController(Schema, Helpers, $state, SalesmanAuth, $scope, DEBUG) {

    const {Outlet, Partner} = Schema.models();
    const {saMedia, saControllerHelper, saEtc} = Helpers;
    const SCROLL_MAIN = 'scroll-main';

    let vm = saControllerHelper.setup(this, $scope);

    let rootState = _.first($state.current.name.match(/sales\.[^.]+/)) || 'sales.territory';

    vm.use({

      partnersSorted: [],

      refresh,
      partnerClick,
      outletClick,
      outletLocationClick,
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


    vm.onScope('rootClick', () => $state.go(rootState));

    vm.watchScope(
      () => saMedia.xsWidth || saMedia.xxsWidth,
      (newValue, oldValue) => {
        DEBUG('saMedia$watch');
        newValue != oldValue && $scope.$broadcast('vsRepeatTrigger');
      }
    );

    /*
     Functions
     */

    function bindData() {

      vm.rebindAll(Partner, {}, 'vm.partnersData', onPartnerChange);

    }

    function onPartnerChange() {

      let outletsByPartner = _.groupBy(Outlet.getAll(), 'partnerId');

      let partnersData = _.map(vm.partnersData, partner => {
        let columns = _.pick(partner, ['name', 'shortName', 'id']);
        return _.assign(columns, {outlets: outletsByPartner[partner.id]})
      })

      vm.partnersSorted = _.orderBy(_.filter(partnersData, 'outlets'), ['shortName', 'name']);

      setupHash();

    }

    function onStateChange(to) {
      _.assign(vm, {
        hideHashes: !/.*territory$/.test(to.name),
        partnerLinkClass: {
          disabled: visitsIsRootState()
        }
      });
    }

    function visitsIsRootState() {
      return rootState === 'sales.visits';
    }

    function rowHeight(partner) {
      let xsMargin = (saMedia.xsWidth || saMedia.xxsWidth) ? 21 : 0;
      return 39 + partner.outlets.length * 29 + 8 + 17 - xsMargin;
    }

    function refresh(salesman) {

      let filter = SalesmanAuth.makeFilter();
      let outletFilter = Outlet.meta.salesmanFilter(SalesmanAuth.makeFilter());

      // TODO: show user-created outlets (with no contract)

      vm.salesman = salesman;

      DEBUG('refresh', 'start');

      vm.setBusy(
        Outlet.findAll(outletFilter, {bypassCache: true, limit: 10000})
          .then(outlets => {

            return Partner.findAll(filter, {bypassCache: true, limit: 10000})
              .then(() => outlets);

          })
      )
        .then(outlets => {

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

          bindData();

          saEtc.scrolTopElementById(SCROLL_MAIN);

        })
        .catch(e => console.error(e));

    }

    function partnerClick(partner) {
      $state.go('.partner', {id: partner.id});
    }

    function outletClick(outlet, params) {
      if (visitsIsRootState()) {
        return $state.go(`${rootState}.outlet.visitCreate`, {id: outlet.id});
      }
      $state.go(`.outlet`, _.assign({id: outlet.id}, params || {}));
    }

    function outletLocationClick(outlet) {
      outletClick(outlet, {showLocation: true})
    }


    function addOutletClick() {
      $state.go('.addOutlet');
    }

    function hashButtons(hash) {

      var hashRe = new RegExp('^' + _.escapeRegExp(hash), 'i');

      var partners = _.filter(vm.partnersSorted, (p) => hashRe.test(p.shortName));

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
      vm.partners = vm.partnersSorted;
      vm.hashButtons = hashButtons('');
      filterPartners();
    }

    function hashClick(btn) {

      var label = btn.label || '';

      if (vm.currentHash === label) {
        vm.currentHash = label.substr(0, label.length - 1);
      } else {
        vm.currentHash = label;
      }

      filterPartners();

    }

    function filterPartners() {
      vm.partners = vm.currentHash
        ? _.filter(vm.partnersSorted, vm.filter)
        : vm.partnersSorted;

      if (vm.currentHash && !vm.partners.length) {
        vm.currentHash = '';
        filterPartners();
      }

      saEtc.scrolTopElementById(SCROLL_MAIN);
    }

  }

  angular.module('webPage')
    .controller('SalesTerritoryController', SalesTerritoryController)
  ;

})();
