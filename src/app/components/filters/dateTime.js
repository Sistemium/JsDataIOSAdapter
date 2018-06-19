(function () {

  angular.module('sistemium')
    .filter('dateTime', moment =>
      function (dateTime, { seconds, date = true } = {}) {

        let localDate = moment.utc(dateTime).local();

        return localDate
          .format(`${date ? 'DD.MM.YYг. ' : ''}в HH:mm${seconds ? ':ss' : ''}`);

      });

})();
