(function () {

  angular.module('sistemium')
    .filter('dateTime', moment =>
      function (dateTime, { seconds, date = true } = {}) {

        return moment(dateTime)
          .format(`${date ? 'DD.MM.YYг. ' : ''}в HH:mm${seconds ? ':ss' : ''}`);

      });

})();
