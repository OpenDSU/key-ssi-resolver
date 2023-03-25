function DSUIdentityExtension() {
    let dsuInstancesRegistry = {};
    const self = this;
    const delayedFunctionCalls = {};
    const getDerefedInstances = (anchorId) => {
        const instances = new Set();
        const weakRefs = dsuInstancesRegistry[anchorId].instances;
        for (let weakRef of weakRefs) {
            instances.add(weakRef.deref());
        }

        return instances;
    }

    const createFunctionCallObject = (dsuInstance, actionName, fn) => {
        return {
            dsuInstance,
            actionName,
            fn
        };
    }

    self.executeOrDelayAction = (dsuInstance, actionName, ...args) => {
        const anchorId = dsuInstance.getAnchorIdSync();
        if (!self.batchInProgress(anchorId)) {
            return dsuInstance[actionName](...args);
        }

        if (!delayedFunctionCalls[anchorId]) {
            delayedFunctionCalls[anchorId] = [createFunctionCallObject(dsuInstance, actionName, () => {
                dsuInstance[actionName](...args);
            })];
            return;
        }

        const stagedInstances = delayedFunctionCalls[anchorId].map((call) => call.dsuInstance);
        const lastIndex = stagedInstances.lastIndexOf(dsuInstance);
        if (lastIndex === -1) {
            delayedFunctionCalls[anchorId].push(createFunctionCallObject(dsuInstance, actionName, () => {
                dsuInstance[actionName](...args);
            }));
            return;
        }

        delayedFunctionCalls[anchorId][lastIndex].splice(lastIndex + 1, 0, createFunctionCallObject(dsuInstance, actionName, () => {
            dsuInstance[actionName](...args);
        }));
    }

    self.batchInProgress = (anchorId) => {
        return !!dsuInstancesRegistry[anchorId].batchInProgress;
    };

    self.beginBatch = (_dsuInstance) => {
        const anchorId = _dsuInstance.getAnchorIdSync();
        if (!self.batchInProgress()) {
            dsuInstancesRegistry[anchorId].batchInProgress = true;
            _dsuInstance.beginBatch();
            return;
        }

        if (!delayedFunctionCalls[anchorId]) {
            delayedFunctionCalls[anchorId] = [];
        }

        delayedFunctionCalls[anchorId].push(() => {
            _dsuInstance.beginBatch();
        });
    }

    self.commitBatch = (_dsuInstance, callback) => {
        const anchorId = _dsuInstance.getAnchorIdSync();
        if (!self.batchInProgress()) {
            return callback();
        }

        _dsuInstance.commitBatch((err) => {
            if (err) {
                return callback(err);
            }

            dsuInstancesRegistry[anchorId].batchInProgress = false;
            const instances = getDerefedInstances(anchorId);
            for (let instance of instances) {
                if (instance) {
                    instance.commitBatch(callback);
                }
            }
        });
    }

    self.put = function (dsuInstance) {
        const anchorId = dsuInstance.getAnchorIdSync();
        if (typeof anchorId !== "string") {
            throw new Error("Keys should be strings");
        }

        if (!dsuInstancesRegistry[anchorId]) {
            dsuInstancesRegistry[anchorId] = {};
        }

        if (!dsuInstancesRegistry[anchorId].instances) {
            dsuInstancesRegistry[anchorId].instances = new Set();
        }
        dsuInstance = dsuInstance ? new WeakRef(dsuInstance) : dsuInstance;
        dsuInstancesRegistry[anchorId].instances.add(dsuInstance);
    }

    self.set = self.put;
}

module.exports = DSUIdentityExtension;