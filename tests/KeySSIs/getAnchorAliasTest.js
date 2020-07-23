require("../../../../psknode/bundles/testsRuntime");
const assert = require("double-check").assert;

const SSITypes = require("../../lib/KeySSIs/SSITypes.js");
const KeySSIFactory = require("../../lib/KeySSIs/KeySSIFactory.js");

assert.callback("Get anchor alias from SeedSSI test", (callback) => {
    const seedSSI = KeySSIFactory.create(SSITypes.SEED_SSI);
    seedSSI.initialize('domain', undefined, undefined, undefined, 'hint', (err, seedSSI) => {
        if (err) {
            throw err;
        }

        assert.true(seedSSI.getAnchorAlias() === seedSSI.derive().derive().getIdentifier());
        callback();
    });
});