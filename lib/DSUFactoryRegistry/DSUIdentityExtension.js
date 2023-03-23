function DSUIdentityExtension() {
    let dsuInstancesRegistry = {};
    const self = this;

    self.batchInProgress = (anchorId ) => {

    }

    self.beginBatch = (_dsuInstance) => {
        console.log(_dsuInstance);
    }

    self.put = function (anchorId, dsuInstance, callback) {
        if (typeof anchorId !== "string") {
            throw new Error("Keys should be strings");
        }

        if (!dsuInstancesRegistry[anchorId]) {
            dsuInstancesRegistry[anchorId] = {};
        }

        if (!dsuInstancesRegistry[anchorId].instances) {
            dsuInstancesRegistry[anchorId].instances = [];
        }
        dsuInstance = dsuInstance ? new WeakRef(dsuInstance) : dsuInstance;
        dsuInstancesRegistry[anchorId].instances.push(dsuInstance);
        if (callback) {
            callback(undefined, true)
        }
    }

    self.set = self.put;
}

module.exports = DSUIdentityExtension;