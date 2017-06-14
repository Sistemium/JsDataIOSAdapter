(function () {

  angular.module('Models').run(Schema => {

    Schema.register({

      name: 'ShipmentEgais',

      relations: {
        // hasOne: {
        //   Shipment: {
        //     localField: 'shipment',
        //     localKey: 'shipmentId'
        //   }
        // }
      }

    });

  });

})();
