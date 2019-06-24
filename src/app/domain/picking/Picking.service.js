(function () {

  angular.module('Warehousing')
    .service('Picking', Picking);

  function Picking(Schema, $q, SoundSynth, Language) {

    const {
      // Article,
      PickingOrder,
      // PickingOrderPosition,
      // WarehouseBox,
      // WarehouseItem,
      // WarehousePalette,
    } = Schema.models();

    return {

      /*
      Speaking
       */

      say(speech) {
        SoundSynth.say(speech);
      },

      replyNotFound() {
        SoundSynth.say('Неизвестный штрих-код');
      },

      replyNotRequested() {
        SoundSynth.say('Этого товара нет в требовании');
      },

      replyAlreadyPicked(ext) {
        SoundSynth.say(`Товар в заказе ${ext || ''}`);
      },

      replyAlreadyPickedOrder(ownerXid) {
        return PickingOrder.find(ownerXid, { cacheResponse: false })
          .then(found => {
            this.replyAlreadyPicked(Language.speakableCount(found.ndoc));
          })
          .catch(() => {
            this.replyAlreadyPicked('с неизвестным номером');
          });
      },

      replyEnoughOfThat() {
        SoundSynth.say('Этого больше не нужно');
      },

      replyTakeAll(num, vol, packageRel) {
        const isFull = packageRel === vol;
        SoundSynth.say(`${isFull ? '' : 'неполная'} коробка ${num || ''}`);
      },

      replyTakePalette(after) {
        SoundSynth.say(`Палета целиком ${after || ''}`);
      },

      replyTaken(num, ord) {
        SoundSynth.say(`Это ${Language.speakableCountFemale(num)} ${ord || ''}`);
      },

      replyTakeSome(pcs, num) {
        this.replyTakeSomeBoxPcs({ pcs }, num);
      },

      replyTakeSomeBoxPcs(boxPcs, num) {
        SoundSynth.say(`Забрать ${Language.speakableBoxPcs(boxPcs)} ${num}`);
      },

      unloadSomeBoxPcs(boxPcs) {
        SoundSynth.say(`Нужно убрать с палеты ${Language.speakableBoxPcs(boxPcs)}`);
      },

      replyLookAtScreen() {
        this.replySuccess('Вопрос на экране');
      },

      repeatToConfirm() {
        SoundSynth.say('Повторите чтобы подтвердить');
      },

      replyNotTheSameOrder() {
        SoundSynth.say('Эта коробка из другого заказа');
      },

      replyError(text) {
        SoundSynth.say(text || 'Ошибка');
      },

      replySuccess(text) {
        SoundSynth.say(text || 'Готово');
      },

    };

  }

})();
