function LegacyDSUFactory(factoryOptions) {
    const LegacyDSU = require("../dsu/LegacyDSU");
    const BarFactory = require("./BarFactory");
    const barFactoryInstance = new BarFactory(factoryOptions);
    const DSUIdentityExtension = require("./DSUIdentityExtension");
    const dsuIdentityExtension = new DSUIdentityExtension();

    const storeDSUInstance = (legacyDSU) => {
        dsuIdentityExtension.put(legacyDSU);
    }

    this.create = (keySSI, options, callback) => {
        barFactoryInstance.create(keySSI, options, (err, barInstance) => {
            if (err) {
                return callback(err);
            }

            const legacyDSU = new LegacyDSU(barInstance, dsuIdentityExtension);
            storeDSUInstance(legacyDSU);
            callback(undefined, legacyDSU);
        })
    }

    this.load = (keySSI, options, callback) => {
        barFactoryInstance.load(keySSI, options, (err, barInstance) => {
            if (err) {
                return callback(err);
            }

            const legacyDSU = new LegacyDSU(barInstance, dsuIdentityExtension);
            storeDSUInstance(legacyDSU);
            callback(undefined, legacyDSU);
        })
    }
}

module.exports = LegacyDSUFactory;
