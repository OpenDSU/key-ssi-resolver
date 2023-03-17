function LegacyDSUFactory(factoryOptions) {
    const LegacyDSU = require("../dsu/LegacyDSU");
    const BarFactory = require("./BarFactory");
    const barFactoryInstance = new BarFactory(factoryOptions);

    this.create = (keySSI, options, callback) => {
        barFactoryInstance.create(keySSI, options, (err, barInstance) => {
            if (err) {
                return callback(err);
            }

            callback(undefined, new LegacyDSU(barInstance));
        })
    }

    this.load = (keySSI, options, callback) => {
        barFactoryInstance.load(keySSI, options, (err, barInstance) => {
            if (err) {
                return callback(err);
            }

            callback(undefined, new LegacyDSU(barInstance));
        })
    }
}

module.exports = LegacyDSUFactory;
