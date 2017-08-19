(function(){

  angular.module('webPage').service('DomainOption', DomainOption);

  function DomainOption(Auth) {

    const customerAlias = {
      dr50: 'r50',
      dev: 'bs'
    };

    return {
      hasInactiveActions,
      hasSaleOrderKS
    };

    function hasInactiveActions() {
      return customerCode() === 'bs';
    }

    function hasSaleOrderKS() {
      return customerCode() === 'r50';
    }

    function customerCode () {
      let org = _.get(Auth.getAccount(), 'org');
      if (!org) return false;
      return customerAlias[org] || org;
    }

  }

})();
