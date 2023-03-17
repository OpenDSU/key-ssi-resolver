function LegacyDSU(bar) {
    const BarFactory = require("../DSUFactoryRegistry/BarFactory");
    const barFactoryInstance = new BarFactory();
    const initialize = (barInstance) => {
        bar = barInstance;
        Object.assign(this, barInstance);
    }

    initialize(bar);

    this.commitBatch = (callback) => {
        bar.commitBatch((err, res) => {
            if (err) {
                return callback(err);
            }

            loadNewBarInstance(callback);
        })
    };

    this.refresh = (callback) => {
        bar.refresh((err) => {
            if (err) {
                return callback(err);
            }

            loadNewBarInstance(callback);
        })
    };


    const loadNewBarInstance = (callback) => {
        bar.getKeySSIAsObject((err, keySSI) => {
            if (err) {
                return callback(err);
            }
            barFactoryInstance.load(keySSI,  (err, _barInstance) => {
                if (err) {
                    return callback(err);
                }

                initialize(_barInstance);
                callback(undefined, this);
            });
        })
    }

    return this;
}

module.exports = LegacyDSU;