function RaceConditionPreventer() {
    const TaskCounter = require("swarmutils").TaskCounter;

    const instancesRegistry = {};
    const self = this;
    const delayedFunctionCalls = {};
    const instancesQueuedForExecution = [];

    self.put = (key, instance) => {
        if (!instancesRegistry[key]) {
            instancesRegistry[key] = new Set();
        }
        instance = instance ? new WeakRef(instance) : instance;
        instancesRegistry[key].add(instance);
    }

    self.set = self.put;

    const getDerefedInstances = (key) => {
        const instances = new Set();
        const weakRefs = instancesRegistry[key];
        if (!weakRefs) {
            return instances;
        }
        for (let weakRef of weakRefs) {
            instances.add(weakRef.deref());
        }

        return instances;
    }

    self.batchInProgress = (key) => {
        const instances = getDerefedInstances(key);
        for (let instance of instances) {
            if (instance && instance.batchInProgress()) {
                return true;
            }
        }
        return false;
    }

    self.executeOrDelayAction = (key, fnCallObj) => {
        if (fnCallObj.args && typeof fnCallObj.args[fnCallObj.args.length - 1] === "function") {
            const cb = fnCallObj.args[fnCallObj.args.length - 1];
            const newCb = (...args) => {
                notifyBatchCommitted(key, (err) => {
                    if (err) {
                        return cb(err);
                    }

                    self.executeDelayedActions(key, cb);
                });
            }

            if (fnCallObj.actionName === "commitBatch") {
                fnCallObj.args[fnCallObj.args.length - 1] = newCb;
            }
        }

        if (!self.batchInProgress(key)) {
            if (fnCallObj.args) {
                return fnCallObj.fn(...fnCallObj.args);
            }
            return fnCallObj.fn();
        }

        if (fnCallObj.callerInstance.batchInProgress()) {
            if (fnCallObj.args) {
                return fnCallObj.fn(...fnCallObj.args);
            }
            return fnCallObj.fn();
        }

        if (!delayedFunctionCalls[key]) {
            delayedFunctionCalls[key] = {};
        }

        let instanceIndex = instancesQueuedForExecution.indexOf(fnCallObj.callerInstance);
        if (instanceIndex === -1) {
            instancesQueuedForExecution.push(fnCallObj.callerInstance);
            instanceIndex = instancesQueuedForExecution.length - 1;
        }

        if (!delayedFunctionCalls[key][instanceIndex]) {
            delayedFunctionCalls[key][instanceIndex] = [];
        }

        delayedFunctionCalls[key][instanceIndex].push(fnCallObj);
        // if (fnCallObj.args && typeof fnCallObj.args[fnCallObj.args.length - 1] === "function") {
        //     fnCallObj.args[fnCallObj.args.length - 1]();
        // }
    }

    const getNoTasks = (key, instanceIndex) => {
        let noTasks = 0;
        const functionCalls = delayedFunctionCalls[key][instanceIndex];
        for (let i = 0; i < functionCalls.length; i++) {
            if (typeof functionCalls[i].args[functionCalls[i].args.length - 1] === "function") {
                noTasks++;
            }
        }

        return noTasks;
    }

    self.executeDelayedActions = (key, callback) => {
        if (!instancesQueuedForExecution.length) {
            return callback();
        }

        const instance = instancesQueuedForExecution.shift();
        const commitBatchActionIndex = delayedFunctionCalls[key][0].findIndex(call => call.actionName === "commitBatch");
        delayedFunctionCalls[key][0].splice(commitBatchActionIndex, 1);
        const taskCounter = new TaskCounter(() => {
            if (commitBatchActionIndex === -1) {
                delayedFunctionCalls[key][0] = [];
                return callback();
            }

            delayedFunctionCalls[key][0] = delayedFunctionCalls[key][0].slice(0, commitBatchActionIndex + 1);
            return instance.commitBatch(callback);
        })
        taskCounter.increment(getNoTasks(key, 0));
        delayedFunctionCalls[key][0].forEach((call) => {
            let cb = call.args[call.args.length - 1];
            if (typeof cb === "function") {
                call.args[call.args.length - 1] = (...args) => {
                    cb(...args);
                    taskCounter.decrement();
                }
            }
            instance[call.actionName](...call.args);
        });
    }

    const notifyBatchCommitted = (key, callback) => {
        const instances = getDerefedInstances(key);
        if(!instances || !instances.size){
            return callback();
        }
        const taskCounter = new TaskCounter(() => {
            callback();
        });

        taskCounter.increment(instances.size);
        instances.forEach((instance) => {
            if (!instance) {
                taskCounter.decrement();
                return;
            }
            instance.refresh((err) => {
                if (err) {
                    return callback(err);
                }
                taskCounter.decrement();
            });
        })
    }
}

module.exports = RaceConditionPreventer;