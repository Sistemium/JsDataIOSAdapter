'use strict';

(function () {

  angular.module('core.services')
    .service('SoundSynth', SoundSynth);

  function SoundSynth($window, toastr, $q, IOS) {

    const rate = 0.4;
    const pitch = 1;
    const speakerCallBackFn = 'speakerCallBack';
    const promises = {};

    let lastSpeech = false;
    let id = 1;

    $window[speakerCallBackFn] = speakerCallBack;

    return {
      say,
      repeat: () => say(lastSpeech)
    };

    /*
    Functions
     */

    function speakerCallBack() {
      _.each(promises, function (promise, id) {
        promise.resolve();
        delete promises[id];
      });
    }

    function speaker(text) {
      return $q((resolve) => {

        promises [id] = {
          resolve: resolve
        };

        IOS.handler('sound').postMessage({
          text: _.trim(text.replace(/[^а-яa-z0-9,]/ig, ' ')),
          rate: rate,
          pitch: pitch,
          callBack: speakerCallBackFn,
          options: {
            requestId: id++
          }
        });

      });
    }

    function mockSpeaker(text) {
      return $q(function (resolve) {
        toastr.success(text);
        resolve();
      });
    }

    function say(text) {
      const sp = IOS.isIos() ? speaker : mockSpeaker;
      lastSpeech = text;
      return sp(text);
    }

  }

})();
