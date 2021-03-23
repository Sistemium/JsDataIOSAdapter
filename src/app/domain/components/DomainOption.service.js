(function () {

  angular.module('webPage').service('DomainOption', DomainOption);

  function DomainOption(Auth, $window, Schema, IOS, $timeout) {

    const customerAlias = {
      dr50: 'r50',
      dev: 'bs',
      dr50p: 'r50p'
    };

    const siteInstance = $window.location.hostname.replace(/\..*/, '');

    const isIOS = IOS.isIos();

    const service = { };

    if (isIOS) {
      $timeout(() => loadClientData(service));
    }

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
      maxDiscount,
      usePriceGroups,
      hasPriceAgent,
      stmArticleGroupId,
      salesTargets,
      perfectShopResponsibility() {
        return [null, 'op'];
      },
      perfectShopEnabled() {
        return /^(bs|r50)$/.test(customerCode()) && (!isIOS || service.appVersion >= 378);
      },
      rnkOption,
      outletTasksDisabled() {
        return customerCode() !== 'r50' || isIOS && service.appVersion < 370;
      },
      hasOutletArticle() {
        return customerCode() === 'bs' && (!isIOS || service.appVersion >= 374) && 'bs';
      },
      hasCampaignTeams() {
        return customerCode() === 'r50';
      },
      hasMZ() {
        return customerCode() !== 'r50p';
      },
    };

    function rnkOption() {
      return /r50p?$/.test(customerCode());
    }

    function salesTargets() {
      // return customerCode() === 'r50' && siteInstance === 'sales';
      return false;
    }

    function maxDiscount() {
      return 50;
    }

    function stmArticleGroupId() {
      switch (customerCode()) {
        case 'r50':
        case 'r50p': {
          return '774c20a5-0364-11e0-bcb9-00237deee66e';
        }
        case 'bs': {
          return 'd10865b8-1595-11e3-8000-dd62b1c1ad0b';
        }
      }
    }

    function hasPriceAgent() {
      return customerCode() === 'bs';
    }

    function usePriceGroups() {
      return /r50p?$/.test(customerCode());

    }

    function allowDiscounts() {
      return customerCode() === 'bs' ||
        _.get(Auth.getAccount(), 'org') === 'dr50' ||
        (customerCode() === 'r50p' && /localhost/.test(siteInstance));
    }

    function saleOrderMaxPositions() {

      switch (customerCode()) {
        case 'r50': {
          return 75;
        }
        case 'r50p': {
          return 25;
        }
        default: {
          return '';
        }
      }

    }

    function showNewsCarousel() {
      return customerCode().match(/r50?/)
        && Auth.isAuthorized(['salesman', 'newsMaker', 'supervisor']);
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
            schemaOption: !Auth.isAuthorized('disableRNK'),
          };
        }

        default: {
          return {};
        }

      }

    }

    function customerCode() {
      let org = _.get(Auth.getAccount(), 'org');
      if (!org) return '';
      return customerAlias[org] || org;
    }

    function site() {
      let site = _.get(Auth.roles(), 'site');
      if (!site) return 1;
      return site;
    }

    function hasArticleFactors() {
      return customerCode().match(/r50?/);
    }

    function hasInactiveActions() {
      return true;
    }

    function hasSaleOrderKS() {
      return customerCode() === 'r50';
    }

    function saleOrdersDisabled() {
      // return 'bs' === _.get(Auth.getAccount(), 'org') && !/jt|localhost/.test(siteInstance);
      return !Auth.isAuthorized(['salesman', 'supervisor']);
    }

    function visitsDisabled() {
      // return customerCode() === 'bs';
    }

    function hasMVZ() {
      return customerCode() === 'r50' && site() === 1;
    }

    function loadClientData(svc) {
      const { ClientData } = Schema.models();
      ClientData.findAll()
        .then(([{ appVersion }]) => {
          svc.appVersion = parseInt(appVersion);
        });
    }

  }

})();
