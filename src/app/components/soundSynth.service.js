'use strict';

(function () {

    angular.module('core.services').service('SoundSynth', function ($window, toastr) {

      var rate = 0.45;
      var pitch = 1;

      var lastSpeech = false;

      function speaker (text) {
        $window.webkit.messageHandlers.sound.postMessage({
          text: text.replace(/[^а-я0-9]/ig,' '),
          rate: rate,
          pitch: pitch
        });
      }

      function mockSpeaker (text) {
        toastr.success (text);
      }

      function say (text) {
        var sp = $window.webkit ? speaker : mockSpeaker;
        lastSpeech = text;
        sp (text);
      }

      return {

        say: say,
        repeat: function () {
          say (lastSpeech);
        }

      };

    });

})();
