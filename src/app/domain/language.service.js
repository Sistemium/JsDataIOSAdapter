'use strict';

(function () {

  function countableState (count) {

    function getState (count) {

      if (count % 100 >= 10 && count % 100 <= 20) {
        return 'w50';
      }

      var lastDigit = count % 10;

      if (lastDigit === 1) {
        return 'w1';
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'w24';
      }

      return 'w50';

    }

    return getState(count || 0);

  }

  function speakableCountFemale (count) {

    function getLast (count) {

      var lastDigit = count % 10;

      if (lastDigit === 1) {
        return 'одна';
      } else if (lastDigit === 2) {
        return 'две';
      }

      return '';

    }

    var str = parseInt(count).toFixed(0);

    if (count % 100 >= 10 && count % 100 <= 20) {
      return str;
    }

    var last = getLast (count);

    return last ? (str.length > 1 ? str.slice (0,str.length - 1) + '0 ' : '') + last : str;

  }

  function speakableBoxPcs (boxPcs) {

    var boxDict = {
      w1: 'коробка',
      w24: 'коробки',
      w50: 'коробок'
    };

    var pcsDict = {
      w1: 'бутылка',
      w24: 'бутылки',
      w50: 'бутылок'
    };

    var box = boxPcs.box ? boxDict [countableState(boxPcs.box)] : '';
    var pcs = boxPcs.pcs ? pcsDict [countableState(boxPcs.pcs)] : '';

    return _.trim (
      (box ? speakableCountFemale (boxPcs.box) + ' ' + box : '')
      + ' '
      + (pcs ? speakableCountFemale (boxPcs.pcs) + ' ' + pcs : '')
    );
  }

  function orderRu (num) {

    var dict = [
      'первый',
      'второй',
      'третий',
      'четвертый',
      'пятый',
      'шестой',
      'седьмой',
      'восьмой',
      'девятый',
      'десятый'
    ];

    return num ? dict [num - 1] : '';

  }

  angular.module('core.services').service('Language', function () {

    return {
      countableState: countableState,
      speakableCountFemale: speakableCountFemale,
      speakableBoxPcs: speakableBoxPcs,
      orderRu: orderRu
    }

  });

})();
