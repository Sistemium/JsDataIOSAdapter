'use strict';

(function (module) {

  module.component('makePhoto', {

    bindings: {
      folder: '<',
      model: '=',
      file: '=',
      modelName: '@'
    },

    transclude: true,

    templateUrl: 'app/components/makePhoto/makePhoto.html',

    controller: makePhotoController,
    controllerAs: 'vm'

  });

  function makePhotoController(Upload, Schema, Auth) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      onSelect

    });

    const {Setting} = Schema.models();

    let imsUrl;

    /*
     Functions
     */

    function $onInit() {
      Setting.findAll({name: 'IMS.url'})
        .then(settings => {
          imsUrl = _.get(_.first(settings), 'value');
        });
    }

    function onSelect(file) {

      if (!file) return;

      upload(file)
        .then(imsData => {

          let picturesInfo = imsData.pictures;
          let href = _.get(_.find(picturesInfo, {name: 'largeImage'}), 'src');
          let thumbnailHref = _.get(_.find(picturesInfo, {name: 'thumbnail'}), 'src');

          _.assign(vm.model, {picturesInfo, href, thumbnailHref});

          vm.modelName && Schema.model(vm.modelName).inject(vm.model);

          console.log(vm.model);

        });

    }

    function upload(file) {

      vm.uploading = {};

      return Upload.upload({
        url: imsUrl,
        data: {
          file: file,
          folder: vm.folder || 'test'
        },
        headers: {'Authorization': Auth.getAccessToken()}
      })
        .progress(progress => {
          vm.uploading && angular.extend(vm.uploading, _.pick(progress, ['loaded', 'total']));
        })
        .then(imsResponse => {
          vm.uploading = false;
          vm.file = file;
          return imsResponse.data;
        })
        .catch(err => {
          console.error(err);
          vm.uploading = false;
        });
    }

  }

})(angular.module('webPage'));