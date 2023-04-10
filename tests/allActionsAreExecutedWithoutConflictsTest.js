'use strict';

require('../../../psknode/bundles/testsRuntime');
const tir = require('../../../psknode/tests/util/tir.js');
const dc = require("double-check");
const assert = dc.assert;

assert.callback("All actions are executed without conflicts test", async (testFinished) => {
    const vaultDomainConfig = {
        anchoring: {
            type: "FS",
            option: {},
        },
    };
    await tir.launchConfigurableApiHubTestNodeAsync({domains: [{name: "vault", config: vaultDomainConfig}]});
    const DSUMock = require('./utils/DSUMock');
    const RaceConditionPreventer = require('../lib/utils/RaceConditionPreventer');
    const raceConditionPreventer = new RaceConditionPreventer();
    const NO_OF_INSTANCES = 10;
    const instances = [];
    const id = 10;
    for (let i = 0; i < NO_OF_INSTANCES; i++) {
        const instance = new DSUMock(id, raceConditionPreventer);
        instances.push(instance);
        raceConditionPreventer.put(id, instance);
    }

    const instance1 = instances[0];
    const instance2 = instances[1];
    instance1.beginBatch();
    await $$.promisify(instance1.writeFile)('/file1', 'content1', {});
    await $$.promisify(instance1.writeFile)('/file2', 'content2', {});
    instance2.beginBatch();
    await $$.promisify(instance2.writeFile)('/file3', 'content3', {});
    await $$.promisify(instance2.commitBatch)();
    await $$.promisify(instance1.commitBatch)();

    for(let i = 0; i < NO_OF_INSTANCES; i++) {
        const instance = instances[i];
        assert.true(instance.getNoRefreshes() === 2, `Instance ${i} should have been refreshed once, but it was refreshed ${instance.getNoRefreshes()} times`);
    }

    testFinished();
}, 500000000);