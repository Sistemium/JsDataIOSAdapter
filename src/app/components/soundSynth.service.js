'use strict';

(function () {

    angular.module('core.services').service('SoundSynth', function ($window, toastr) {

      var rate = 0.45;
      var pitch = 1;

      var speaker = function (text) {
        $window.webkit.messageHandlers.sound.postMessage({
          text: text,
          rate: rate,
          pitch: pitch
        });
      };

      if (!$window.webkit) {
        speaker = function (text) {
          toastr.success (text);
        };
      }

      return {

        say: speaker

      };

    });

})();
