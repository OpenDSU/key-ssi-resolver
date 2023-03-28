function DSUIdentityExtension() {
    const BarFactory = require("./BarFactory");
    const barFactoryInstance = new BarFactory();
    const TaskCounter = require("swarmutils").TaskCounter;
    let dsuInstancesRegistry = {};
    const self = this;
    const delayedFunctionCalls = {};
    const stagedDSUInstances = []
    const getDerefedInstances = (anchorId) => {
        const instances = new Set();
        const weakRefs = dsuInstancesRegistry[anchorId];
        for (let weakRef of weakRefs) {
            instances.add(weakRef.deref());
        }

        return instances;
    }

    const loadNewBarInstance = (bar, callback) => {
        bar.getKeySSIAsObject((err, keySSI) => {
            if (err) {
                return callback(err);
            }
            barFactoryInstance.load(keySSI, (err, _barInstance) => {
                if (err) {
                    return callback(err);
                }

                bar = _barInstance;
                callback(undefined, _barInstance);
            });
        })
    }

    const createFunctionCallObject = (dsuInstance, actionName, args) => {
        return {
            dsuInstance,
            actionName,
            args
        };
    }

    self.executeOrDelayAction = (dsuInstance, actionName, ...args) => {
        const anchorId = dsuInstance.getAnchorIdSync();
        if (!batchInProgress(anchorId)) {
            return dsuInstance.getBarInstance()[actionName](...args);
        }

        if (dsuInstance.batchInProgress()) {
            return dsuInstance.getBarInstance()[actionName](...args);
        }

        if (!delayedFunctionCalls[anchorId]) {
            delayedFunctionCalls[anchorId] = {};
        }

        let instanceIndex = stagedDSUInstances.indexOf(dsuInstance);
        if (instanceIndex === -1) {
            stagedDSUInstances.push(dsuInstance);
            instanceIndex++;
        }

        if (!delayedFunctionCalls[anchorId][instanceIndex]) {
            delayedFunctionCalls[anchorId][instanceIndex] = [];
        }

        delayedFunctionCalls[anchorId][instanceIndex].push(createFunctionCallObject(dsuInstance, actionName, args));
    }

    const batchInProgress = (anchorId) => {
        const instances = getDerefedInstances(anchorId);
        for (let instance of instances) {
            if (instance && instance.batchInProgress()) {
                return true;
            }
        }

        return false;
    };

    const determineInstanceWhoseActionsToExecute = () => {
        for (let instanceIndex in stagedDSUInstances) {
            const commitBatchActionIndex = delayedFunctionCalls[stagedDSUInstances[instanceIndex].getAnchorIdSync()][0].findIndex(call => call.actionName === "commitBatch");
            if (commitBatchActionIndex !== -1) {
                return {
                    instanceIndex,
                    commitBatchActionIndex
                };
            }
        }

    }

    const getNoTasks = (anchorId, instanceIndex) => {
        let noTasks = 0;
        const functionCalls = delayedFunctionCalls[anchorId][instanceIndex];
        for (let i = 0; i < functionCalls.length; i++) {
            if (functionCalls[i].args[functionCalls[i].args.length - 1] === "function") {
                noTasks++;
            }
        }

        return noTasks;
    }

    const executeDelayedFunctionCalls = (callback) => {
        if (stagedDSUInstances.length === 0) {
            return callback();
        }

        const dsuInstance = stagedDSUInstances.shift();
        const anchorId = dsuInstance.getAnchorIdSync();
        const commitBatchActionIndex = delayedFunctionCalls[anchorId][0].findIndex(call => call.actionName === "commitBatch");
        const taskCounter = new TaskCounter(() => {
            if (commitBatchActionIndex === -1) {
                return callback();
            }

            self.commitBatch(dsuInstance, callback);
        })

        taskCounter.increment(getNoTasks(anchorId, 0));
        delayedFunctionCalls[anchorId][0].forEach((call) => {
            let cb = call.args[call.args.length - 1];
            if (typeof cb === "function") {
                call.args[call.args.length - 1] = function (...args) {
                    cb(...args);
                    taskCounter.decrement();
                }
            }
            dsuInstance[call.actionName](...call.args);
        });
    }

    const notifyBatchCommitted = (anchorId, callback) => {
        const instances = getDerefedInstances(anchorId);
        const taskCounter = new TaskCounter(() => {
            callback();
        });

        taskCounter.increment(instances.size);
        instances.forEach((instance) => {
            setNewBarInstanceForLegacyDSU(instance, (err) => {
                if (err) {
                    return callback(err);
                }
                taskCounter.decrement();
            });
        })
    }

    self.commitBatch = (_dsuInstance, callback) => {
        if (_dsuInstance.batchInProgress()) {
            _dsuInstance.getBarInstance().commitBatch((err) => {
                if (err) {
                    return callback(err);
                }

                setNewBarInstanceForLegacyDSU(_dsuInstance, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    notifyBatchCommitted(_dsuInstance.getAnchorIdSync(), (err) => {
                        if (err) {
                            return callback(err);
                        }
                        executeDelayedFunctionCalls(callback);
                    });
                });
            })
        }
    }

    self.refresh = (dsuInstance, callback) => {
        setNewBarInstanceForLegacyDSU(dsuInstance, callback);
    }

    const setNewBarInstanceForLegacyDSU = (dsuInstance, callback) => {
        loadNewBarInstance(dsuInstance.getBarInstance(), (err, _barInstance) => {
            if (err) {
                return callback(err);
            }
            dsuInstance.setBarInstance(_barInstance);
            callback();
        });
    }

    self.put = function (dsuInstance) {
        const anchorId = dsuInstance.getAnchorIdSync();
        if (typeof anchorId !== "string") {
            throw new Error("Keys should be strings");
        }

        if (!dsuInstancesRegistry[anchorId]) {
            dsuInstancesRegistry[anchorId] = new Set();
        }
        dsuInstance = dsuInstance ? new WeakRef(dsuInstance) : dsuInstance;
        dsuInstancesRegistry[anchorId].add(dsuInstance);
    }

    self.set = self.put;
}

module.exports = DSUIdentityExtension;