'use strict';

(function (module) {

  module.component('makePhoto', {

    bindings: {
      folder: '<',
      model: '=?',
      defaults: '<',
      modelName: '@',
      busy: '='
    },

    transclude: true,

    templateUrl: 'app/components/makePhoto/makePhoto.html',

    controller: makePhotoController,
    controllerAs: 'vm'

  });

  function makePhotoController(Upload, Schema, Auth, IOS, PhotoHelper) {

    const { Setting } = Schema.models();

    const vm = _.assign(this, {

      $onInit,
      onSelect,
      imsUrl: null,

      makePhotoClick() {
        this.busy = PhotoHelper.makePhoto(this.modelName, this.defaultProps())
          .then(res => {
            this.model = res;
          });
      },

      defaultProps(props) {
        return _.assign(this.model, props, this.defaults);
      },

    });

    /*
     Functions
     */

    function $onInit() {

      vm.isIos = IOS.supportsPhotos();

      if (vm.isIos) return;

      Setting.findAll({name: 'IMS.url'})
        .then(settings => {
          vm.imsUrl = _.get(_.first(settings), 'value');
        });

    }

    function onSelect(file) {

      if (!file) return;

      vm.busy = upload(file)
        .then(imsData => {

          let picturesInfo = imsData.pictures;
          let href = _.get(_.find(picturesInfo, {name: 'largeImage'}), 'src');
          let thumbnailHref = _.get(_.find(picturesInfo, {name: 'thumbnail'}), 'src');

          const props = vm.defaultProps({ href, thumbnailHref, picturesInfo });

          if (vm.modelName) {
            return Schema.model(vm.modelName).create(props)
              .then(savedModel => vm.model = savedModel);
          }

        });

    }

    function upload(file) {

      vm.uploading = {};

      let folder = vm.folder || `${vm.modelName}/${moment().format('YYYY/MM/DD')}`;

      return Upload.upload({
        url: vm.imsUrl,
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
