'use strict';

(function () {

  angular.module('webPage')
    .controller('PickerInfoController', PickerInfoController);

  function PickerInfoController ($scope, $state, Schema, PickerAuth) {

    var vm = this;
    var Picker = Schema.model('Picker');

    vm.data = Picker.getCurrent();

    if (!vm.data) {
      return $state.go ('login');
    }

    vm.cancel = function () {
      vm.data = Picker.revert (vm.data.id);
      $scope.pickerForm.$setPristine();
    };

    vm.submit = function () {
      Picker.save (vm.data.id).then (function (){
        $scope.pickerForm.$setPristine();
      });
    };

    vm.logout = function () {
      PickerAuth.logout();
      Picker.logout();
      $state.go ('login');
    }

  }

})();
