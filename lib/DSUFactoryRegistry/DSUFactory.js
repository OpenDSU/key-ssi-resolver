const dsuTypesFactoryRegistry = {}
const DSUTypes = require("./DSUTypes");

function DSUFactory(factoryOptions) {
    const defaultInstanceOptions = {dsuType: DSUTypes.LEGACY_DSU};

    this.create = (keySSI, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        Object.assign(defaultInstanceOptions, options);
        options = defaultInstanceOptions;
        if (typeof dsuTypesFactoryRegistry[options.dsuType] !== "function") {
            return callback(Error(`No factory registered for dsu type <${options.dsuType}>`));
        }

        const factoryInstance = dsuTypesFactoryRegistry[options.dsuType](factoryOptions);
        factoryInstance.create(keySSI, options, callback);
    }

    this.load = (keySSI, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        Object.assign(defaultInstanceOptions, options);
        options = defaultInstanceOptions;
        if (typeof dsuTypesFactoryRegistry[options.dsuType] !== "function") {
            return callback(Error(`No factory registered for dsu type <${options.dsuType}>`));
        }

        const factoryInstance = dsuTypesFactoryRegistry[options.dsuType](factoryOptions);
        factoryInstance.load(keySSI, options, callback);
    }
}

DSUFactory.prototype.registerDSUTypeFactory = (dsuType, factory) => {
    dsuTypesFactoryRegistry[dsuType] = factory;
}

const LegacyDSUFactory = require("./LegacyDSUFactory");
const BarFactory = require("./BarFactory");

DSUFactory.prototype.registerDSUTypeFactory(DSUTypes.LEGACY_DSU, function (factoryOptions) {
    return new LegacyDSUFactory(factoryOptions);
});
DSUFactory.prototype.registerDSUTypeFactory(DSUTypes.BAR, function (factoryOptions) {
    return new BarFactory(factoryOptions);
});

module.exports = DSUFactory;
