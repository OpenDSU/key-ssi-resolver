function DSUMock(id, dsuInstancesRegistry) {
    const dsuData = {};
    let noRefreshes = 0;
    let batchInProgress = false;
    const self = this;
    const createFunctionCallObject = (callerInstance, actionName, fn, args) => {
        return {
            callerInstance,
            actionName,
            fn,
            args
        };

    }

    this.getAnchorIdSync = function () {
        return id;
    }

    this.beginBatch = () => {
        const fnCallObj = createFunctionCallObject(self, "beginBatch", () => {
            console.log("beginBatch");
            batchInProgress = true;
        });
        dsuInstancesRegistry.executeOrDelayAction(id, fnCallObj);
    }

    this.commitBatch = function (callback) {
        const args = [callback];
        const fnCallObj = createFunctionCallObject(self, "commitBatch", (...args) => {
            console.log("commitBatch");
            batchInProgress = false;
            args[0]();
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(id, fnCallObj);
    }

    this.cancelBatch = function (callback) {
        console.log("cancelBatch");
        callback();
    }

    this.batchInProgress = function () {
        return batchInProgress;
    }

    this.writeFile = function (path, data, options, callback) {
        if(typeof options === "function"){
            callback = options;
            options = undefined;
        }

        if(typeof data === "function"){
            callback = data;
            data = "";
            options = undefined;
        }

        if(Buffer.isBuffer(data)){
            data = data.toString();
        }

        const args = [path, data, options, callback];
        const fnCallObj = createFunctionCallObject(self, "writeFile", (...args) => {
            dsuData[path] = data;
            callback();
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(id, fnCallObj);
    }

    this.refresh = function (callback) {
        noRefreshes++;
        callback();
    }

    this.getNoRefreshes = function () {
        return noRefreshes;
    }
}

module.exports = DSUMock;