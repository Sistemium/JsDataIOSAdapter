'use strict';

(function (module) {

  module.component('makePhoto', {

    bindings: {
      folder: '<',
      model: '=',
      modelName: '@',
      busy: '='
    },

    transclude: true,

    templateUrl: 'app/components/makePhoto/makePhoto.html',

    controller: makePhotoController,
    controllerAs: 'vm'

  });

  function makePhotoController(Upload, Schema, Auth, IOS, PhotoHelper) {

    let vm = this;

    _.assign(vm, {

      $onInit,
      onSelect,

      makePhotoClick

    });

    const {Setting} = Schema.models();

    let imsUrl;

    /*
     Functions
     */

    function makePhotoClick() {
      vm.busy = PhotoHelper.makePhoto(vm.modelName, vm.model || {})
        .then(res => {
          vm.model = res;
        });
    }

    function $onInit() {

      vm.isIos = IOS.isIos();

      if (vm.isIos) return;

      Setting.findAll({name: 'IMS.url'})
        .then(settings => {
          imsUrl = _.get(_.first(settings), 'value');
        });

    }

    function onSelect(file) {

      if (!file) return;

      vm.busy = upload(file)
        .then(imsData => {

          let picturesInfo = imsData.pictures;
          let href = _.get(_.find(picturesInfo, {name: 'largeImage'}), 'src');
          let thumbnailHref = _.get(_.find(picturesInfo, {name: 'thumbnail'}), 'src');

          _.assign(vm.model, {picturesInfo, href, thumbnailHref});

          if (vm.modelName) {
            return Schema.model(vm.modelName).create(vm.model)
              .then(savedModel => vm.model = savedModel);
          }

        });

    }

    function upload(file) {

      vm.uploading = {};

      let folder = vm.folder || `${vm.modelName}/${moment().format('YYYY/MM/DD')}`;

      return Upload.upload({
        url: imsUrl,
        data: {
          file,
          folder
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
