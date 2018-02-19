(function () {

  angular.module('webPage').service('DomainOption', DomainOption);

  function DomainOption(Auth, $window) {

    const customerAlias = {
      dr50: 'r50',
      dev: 'bs',
      dr50p: 'r50p'
    };

    const siteInstance = $window.location.hostname.replace(/\..*/, '');

    return {
      hasMVZ,
      hasInactiveActions,
      hasSaleOrderKS,
      saleOrderOptions,
      saleOrdersDisabled,
      visitsDisabled,
      showNewsCarousel,
      hasArticleFactors,
      saleOrderMaxPositions,
      allowDiscounts,
      usePriceGroups,
      hasPriceAgent
    };

    function hasPriceAgent() {
      return customerCode() === 'bs';
    }

    function usePriceGroups() {
      return /r50p?$/.test(customerCode());

    }

    function allowDiscounts() {
      return customerCode() === 'bs' ||
        _.get(Auth.getAccount(), 'org') === 'dr50' ||
        (customerCode() === 'r50p' && /isd|localhost/.test(siteInstance));
    }

    function saleOrderMaxPositions() {

      switch (customerCode()) {
        case 'r50': {
          return 50;
        }
        case 'r50p': {
          return 40;
        }
        default: {
          return false;
        }
      }

    }

    function showNewsCarousel() {
      return customerCode().match(/r50?/) && Auth.isAuthorized(['salesman', 'newsMaker', 'supervisor']);
    }

    function saleOrderOptions() {

      switch (customerCode()) {

        case 'r50': {
          return {
            docDiscountsOption: true
          };
        }

        case 'bs': {
          return {
            commentExpeditorOption: true,
            cashOnShipmentOption: false,
            schemaOption: true
          };
        }

        default: {
          return {};
        }

      }

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

    function hasArticleFactors() {
      return customerCode() === 'r50';
    }

    function hasInactiveActions() {
      return customerCode() === 'bs';
    }

    function hasSaleOrderKS() {
      return customerCode() === 'r50';
    }

    function saleOrdersDisabled() {
      return 'bs' === _.get(Auth.getAccount(), 'org') && !/jt|localhost/.test(siteInstance);
    }

    function visitsDisabled() {
      return customerCode() !== 'r50';
    }

    function hasMVZ() {
      return customerCode() === 'r50' && site() === 1;
    }

  }

})();
