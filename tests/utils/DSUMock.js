function DSUMock(id, dsuInstancesRegistry) {
    const dsuData = {};
    let noRefreshes = 0;
    let batchInProgress = false;
    const self = this;
    const createCallObject = (callerInstance, actionName, fn, args) => {
        return {
            callerInstance, actionName, fn, args
        };

    }

    this.getAnchorIdSync = () => {
        return id;
    }

    this.beginBatch = () => {
        console.log("beginBatch");
        batchInProgress = true;
    }

    this.safeBeginBatch = (callback) => {
        if (dsuInstancesRegistry.batchInProgress(id)) {
            return callback(Error("Another instance has started a batch"));
        }

        this.beginBatch();
        callback();
    }

    this.commitBatch = (callback) => {
        console.log("commitBatch");
        batchInProgress = false;
        dsuInstancesRegistry.notifyBatchCommitted(id, (err) => {
            if (err) {
                return callback(err);
            }

            callback();
        })
    }

    this.cancelBatch = (callback) => {
        console.log("cancelBatch");
        callback();
    }

    this.batchInProgress = () => {
        return batchInProgress;
    }

    this.writeFile = (path, data, options, callback) => {
        if (typeof options === "") {
            callback = options;
            options = undefined;
        }

        if (typeof data === "") {
            callback = data;
            data = "";
            options = undefined;
        }

        if (Buffer.isBuffer(data)) {
            data = data.toString();
        }

        dsuData[path] = data;
        callback();
    }

    this.readFile = (path, options, callback) => {
        if (typeof options === "") {
            callback = options;
            options = undefined;
        }

        if (!dsuData[path]) {
            return callback(Error("File does not exist"));
        }

        callback(undefined, dsuData[path]);
    }

    this.refresh = (callback) => {
        noRefreshes++;
        callback();
    }

    this.getNoRefreshes = () => {
        return noRefreshes;
    }
}

module.exports = DSUMock;