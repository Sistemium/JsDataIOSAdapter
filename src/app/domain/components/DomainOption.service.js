(function () {

  angular.module('webPage').service('DomainOption', DomainOption);

  function DomainOption(Auth) {

    const customerAlias = {
      dr50: 'r50',
      dev: 'bs'
    };

    return {
      hasMVZ,
      hasInactiveActions,
      hasSaleOrderKS,
      saleOrderOptions,
      saleOrdersDisabled,
      visitsDisabled
    };

    function saleOrderOptions() {
      if (customerCode() === 'r50') {
        return {
          docDiscountsOption: true
        };
      }

      return {};

    }

    function customerCode() {
      let org = _.get(Auth.getAccount(), 'org');
      if (!org) return false;
      return customerAlias[org] || org;
    }

    function site() {
      let site = _.get(Auth.roles(), 'site');
      if (!site) return 1;
      return site;
    }

    function hasInactiveActions() {
      return customerCode() === 'bs';
    }

    function hasSaleOrderKS() {
      return customerCode() === 'r50';
    }

    function saleOrdersDisabled() {
      return customerCode() === 'bs';
    }

    function visitsDisabled() {
      return customerCode() !== 'r50';
    }

    function hasMVZ() {
      return customerCode() === 'r50' && site() === 1;
    }

  }

})();
