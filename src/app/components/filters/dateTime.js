(function () {

  angular.module('sistemium')
    .filter('dateTime', moment =>
      function (dateTime, { seconds, date = true, time = true } = {}) {

        let localDate = moment.utc(dateTime).local();

        return localDate
          .format(`${date ? 'DD.MM.YYг.' : ''}${time?' в HH:mm':''}${time && seconds ? ':ss' : ''}`);

      });

})();
