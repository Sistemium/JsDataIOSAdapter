(function () {

  angular.module('sistemium')
    .filter('dateTime', moment => {

      return function (dateTime, { seconds } = {}) {
        return moment(dateTime)
          .format(`DD.MM.YYг. в HH:mm${seconds ? ':ss' : ''}`);
      }


    });


})();
