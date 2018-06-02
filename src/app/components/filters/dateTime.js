(function () {

  angular.module('sistemium')
    .filter('dateTime', moment => {

      return function (dateTime) {
        return moment(dateTime).format('DD.MM.YYг. в HH:mm')
      }


    });


})();
