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

    const createFunctionCallObject = (_dsuInstance, actionName, args) => {
        return {
            _dsuInstance,
            actionName,
            args
        };
    }

    self.executeOrDelayAction = (_dsuInstance, actionName, ...args) => {
        const anchorId = _dsuInstance.getAnchorIdSync();
        if (!batchInProgress(anchorId)) {
            return _dsuInstance.getBarInstance()[actionName](...args);
        }

        if (_dsuInstance.batchInProgress()) {
            return _dsuInstance.getBarInstance()[actionName](...args);
        }

        if (!delayedFunctionCalls[anchorId]) {
            delayedFunctionCalls[anchorId] = {};
        }

        let instanceIndex = stagedDSUInstances.indexOf(_dsuInstance);
        if (instanceIndex === -1) {
            stagedDSUInstances.push(_dsuInstance);
            instanceIndex++;
        }

        if (!delayedFunctionCalls[anchorId][instanceIndex]) {
            delayedFunctionCalls[anchorId][instanceIndex] = [];
        }

        delayedFunctionCalls[anchorId][instanceIndex].push(createFunctionCallObject(_dsuInstance, actionName, args));
        if (typeof args[args.length - 1] === "function") {
            args[args.length - 1]();
        }
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

    const getNoTasks = (anchorId, instanceIndex) => {
        let noTasks = 0;
        const functionCalls = delayedFunctionCalls[anchorId][instanceIndex];
        for (let i = 0; i < functionCalls.length; i++) {
            if (typeof functionCalls[i].args[functionCalls[i].args.length - 1] === "function") {
                noTasks++;
            }
        }

        return noTasks;
    }

    const executeDelayedFunctionCalls = (callback) => {
        if (stagedDSUInstances.length === 0) {
            return callback();
        }

        const _dsuInstance = stagedDSUInstances.shift();
        const anchorId = _dsuInstance.getAnchorIdSync();
        const commitBatchActionIndex = delayedFunctionCalls[anchorId][0].findIndex(call => call.actionName === "commitBatch");
        delayedFunctionCalls[anchorId][0].splice(commitBatchActionIndex, 1);
        const taskCounter = new TaskCounter(() => {
            if (commitBatchActionIndex === -1) {
                delayedFunctionCalls[anchorId][0] = [];
                return callback();
            }

            delayedFunctionCalls[anchorId][0] = delayedFunctionCalls[anchorId][0].slice(0, commitBatchActionIndex + 1);
            return _dsuInstance.commitBatch(callback);
        })
        taskCounter.increment(getNoTasks(anchorId, 0));
        delayedFunctionCalls[anchorId][0].forEach((call) => {
            let cb = call.args[call.args.length - 1];
            if (typeof cb === "function") {
                call.args[call.args.length - 1] =  (...args) => {
                    cb(...args);
                    taskCounter.decrement();
                }
            }
            _dsuInstance[call.actionName](...call.args);
        });
    }

    const notifyBatchCommitted = (anchorId, callback) => {
        const instances = getDerefedInstances(anchorId);
        const taskCounter = new TaskCounter(() => {
            callback();
        });

        taskCounter.increment(instances.size);
        instances.forEach((instance) => {
            if (!instance) {
                taskCounter.decrement();
                return;
            }
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
        } else {
            self.executeOrDelayAction(_dsuInstance, "commitBatch", callback);
        }
    }

    self.refresh = (_dsuInstance, callback) => {
        setNewBarInstanceForLegacyDSU(_dsuInstance, callback);
    }

    const setNewBarInstanceForLegacyDSU = (_dsuInstance, callback) => {
        loadNewBarInstance(_dsuInstance.getBarInstance(), (err, _barInstance) => {
            if (err) {
                return callback(err);
            }
            _dsuInstance.setBarInstance(_barInstance);
            callback();
        });
    }

    self.put = function (_dsuInstance) {
        const anchorId = _dsuInstance.getAnchorIdSync();
        if (typeof anchorId !== "string") {
            throw new Error("Keys should be strings");
        }

        if (!dsuInstancesRegistry[anchorId]) {
            dsuInstancesRegistry[anchorId] = new Set();
        }
        _dsuInstance = _dsuInstance ? new WeakRef(_dsuInstance) : _dsuInstance;
        dsuInstancesRegistry[anchorId].add(_dsuInstance);
    }

    self.set = self.put;
}

module.exports = DSUIdentityExtension;