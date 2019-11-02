(function () {

  angular.module('Models')
    .run(function (Schema) {

    Schema.register({

      name: 'PossibleOutlet',

      relations: {
        hasOne: {
          Salesman: {
            localField: 'salesman',
            localKey: 'salesmanId',
          },
          Location: {
            localField: 'location',
            localKey: 'locationId',
          },
        },
        hasMany: {
          PossibleOutletPhoto: {
            localField: 'photos',
            foreignKey: 'possibleOutletId',
          },
        },
      },

      methods: {
        statusIcon() {
          const hasLocation = this.locationId;
          const hasPhotos = this.photos.length;
          if (hasPhotos && hasLocation) {
            return 'glyphicon-ok green';
          }
          if (hasLocation) {
            return 'glyphicon-map-marker';
          }
          if (hasPhotos) {
            return 'glyphicon-camera';
          }
        },
      },

    });

  });

})();
