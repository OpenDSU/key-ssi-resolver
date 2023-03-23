const KeySSIMixin = require("../KeySSIMixin");
const CZaSSI = require("./CZaSSI");
const SSITypes = require("../SSITypes");
const cryptoRegistry = require("../../CryptoAlgorithms/CryptoAlgorithmsRegistry");
const SSIFamilies = require("../SSIFamilies");

function ConstSSI(enclave, identifier) {
    if (typeof enclave === "string") {
        identifier = enclave;
        enclave = undefined;
    }
    KeySSIMixin(this, enclave);
    const self = this;
    if (typeof identifier !== "undefined") {
        self.autoLoad(identifier);
    }

    self.getTypeName = function () {
        return SSITypes.CONST_SSI;
    }

    self.initialize = (dlDomain, constString, vn, hint) => {
        const key = cryptoRegistry.getKeyDerivationFunction(self)(constString, 1000);
        self.load(SSITypes.CONST_SSI, dlDomain, cryptoRegistry.getBase64EncodingFunction(self)(key), "", vn, hint);
    };

    self.getEncryptionKey = (callback) => {
        try {
            const encryptionKey = cryptoRegistry.getBase64DecodingFunction(self)(self.getSpecificString());
            if (typeof callback === "function") {
                return callback(undefined, encryptionKey);
            }

            return encryptionKey
        } catch (e) {
            if (typeof callback === "function") {
                return callback(e);
            }

            throw e;
        }
    };

    self.derive = (callback) => {
        const cZaSSI = CZaSSI.createCZaSSI();
        try {
            const encryptionKey = self.getEncryptionKey();
            const subtypeKey = cryptoRegistry.getHashFunction(self)(encryptionKey);
            cZaSSI.load(SSITypes.CONSTANT_ZERO_ACCESS_SSI, self.getDLDomain(), subtypeKey, self.getControlString(), self.getVn(), self.getHint());
            if (typeof callback === "function") {
                return callback(undefined, cZaSSI);
            }

            return cZaSSI;
        } catch (e) {
            if (typeof callback === "function") {
                return callback(e);
            }

            throw e;
        }
    };

    self.createAnchorValue = function (brickMapHash, previousAnchorValue, callback) {
        if (typeof previousAnchorValue === "function") {
            callback = previousAnchorValue;
            previousAnchorValue = undefined;
        }
        try {
            const keySSIFactory = require("../KeySSIFactory");
            const hashLinkSSI = keySSIFactory.createType(SSITypes.HASH_LINK_SSI);
            hashLinkSSI.initialize(self.getBricksDomain(), brickMapHash, self.getVn(), self.getHint());
            callback(undefined, hashLinkSSI);
        } catch (e) {
            return callback(e);
        }
    }

    self.canAppend = function () {
        return false;
    }

    self.getFamilyName = () => {
        return SSIFamilies.CONST_SSI_FAMILY;
    }
}

function createConstSSI(enclave, identifier) {
    return new ConstSSI(enclave, identifier);
}

module.exports = {
    createConstSSI
};
