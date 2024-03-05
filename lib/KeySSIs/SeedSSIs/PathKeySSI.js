const KeySSIMixin = require("../KeySSIMixin");
const SeedSSI = require("./SeedSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../../CryptoAlgorithms/CryptoAlgorithmsRegistry");
const SSIFamilies = require("../SSIFamilies");

function PathKeySSI(enclave, identifier) {
    if (typeof enclave === "string") {
        identifier = enclave;
        enclave = undefined;
    }
    KeySSIMixin(this, enclave);
    const self = this;
    let privateKey;

    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.getTypeName = function () {
        return SSITypes.PATH_SSI;
    }

    self.setCanSign(true);

    const _getEnclave = (callback) => {
        const openDSU = require("opendsu")
        const scAPI = openDSU.loadAPI("sc")
        scAPI.getSharedEnclave((err, sharedEnclave) => {
            if (err) {
                return scAPI.getMainEnclave(callback);
            }

            callback(undefined, sharedEnclave);
        });
    }

    self.deriveSync = () => {
        throw Error("PathSSIs cannot be derived synchronously");
    }

    self.derive = function (callback) {
        const specificString = self.getSpecificString();
        const index = specificString.indexOf("/");
        const slot = specificString.slice(0, index);
        const path = specificString.slice(index + 1);

        const __getPrivateKeyForSlot = () => {
            enclave.getPrivateKeyForSlot(slot, (err, _privateKey) => {
                if (err) {
                    return callback(err);
                }

                console.debug("===========================================================================================");
                console.debug("PRIVATE KEY", JSON.stringify(_privateKey));
                try {
                    privateKey = _privateKey;
                    privateKey = cryptoRegistry.getHashFunction(self)(`${path}${privateKey}`);
                    privateKey = cryptoRegistry.getDecodingFunction(self)(privateKey);
                    const seedSpecificString = cryptoRegistry.getBase64EncodingFunction(self)(privateKey);
                    console.debug("SEED SPECIFIC STRING", seedSpecificString);
                    const seedSSI = SeedSSI.createSeedSSI(enclave);
                    seedSSI.load(SSITypes.SEED_SSI, self.getDLDomain(), seedSpecificString, undefined, self.getVn(), self.getHint());
                    console.debug("SEED SSI", seedSSI.getIdentifier());
                    console.debug("ANCHOR ID", seedSSI.getAnchorIdSync());
                    console.debug("===========================================================================================");
                    callback(undefined, seedSSI);
                } catch (e) {
                    callback(e);
                }
            });
        }

        if (typeof enclave === "undefined") {
            _getEnclave((err, _enclave) => {
                if (err) {
                    return callback(err);
                }

                enclave = _enclave;
                __getPrivateKeyForSlot();
            })

            return;
        }

        __getPrivateKeyForSlot();
    };

    self.getPrivateKey = function (format) {
        let validSpecificString = self.getSpecificString();
        if (validSpecificString === undefined) {
            throw Error("Operation requested on an invalid SeedSSI. Initialise first")
        }
        let privateKey = cryptoRegistry.getBase64DecodingFunction(self)(validSpecificString);
        if (format === "pem") {
            const pemKeys = cryptoRegistry.getKeyPairGenerator(self)().getPemKeys(privateKey, self.getPublicKey("raw"));
            privateKey = pemKeys.privateKey;
        }
        return privateKey;
    }

    self.sign = function (dataToSign, callback) {
        self.derive((err, seedSSI) => {
            if (err) {
                return callback(err);
            }

            seedSSI.sign(dataToSign, callback);
        })
    }

    self.getPublicKey = function (format) {
        return cryptoRegistry.getDerivePublicKeyFunction(self)(self.getPrivateKey(), format);
    }

    self.getEncryptionKey = function (callback) {
        self.derive((err, seedSSI) => {
            if (err) {
                return callback(err);
            }

            seedSSI.getEncryptionKey(callback);
        })
    };

    self.getKeyPair = function () {
        const keyPair = {
            privateKey: self.getPrivateKey("pem"),
            publicKey: self.getPublicKey("pem")
        }

        return keyPair;
    }

    self.getFamilyName = () => {
        return SSIFamilies.SEED_SSI_FAMILY;
    }
}

function createPathKeySSI(enclave, identifier) {
    return new PathKeySSI(enclave, identifier);
}

module.exports = {
    createPathKeySSI
};
