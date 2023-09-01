function LegacyDSU(bar, dsuInstancesRegistry) {
    const BarFactory = require("../DSUFactoryRegistry/BarFactory");
    const barFactoryInstance = new BarFactory();
    const constants = require("opendsu").constants;
    let waitCallback;

    let inProgressBatches = new Set();

    let dsuId;
    bar.getAnchorId((err, anchorId)=>{
        dsuId = anchorId;
    });

    const convertUpdateFnToAsync = (updateFn, ...args) => {
        if (!this.batchInProgress()) {
            throw Error("No batch has been started");
        }

        return $$.promisify(updateFn)(...args);
    }

    const convertGetFunctionToAsync = (getFn, ...args) => {
        return $$.promisify(getFn)(...args);
    }

    this.setBarInstance = (_barInstance) => {
        bar = _barInstance;
        const errorAPI = require("opendsu").loadAPI("error");
        if (typeof waitCallback === "function") {
            if (dsuInstancesRegistry.batchInProgress(this.getAnchorIdSync())) {
                return;
            }

            bar.beginBatch();
            try {
                waitCallback();
            } catch (e) {
                errorAPI.reportUserRelevantError("Failed to call function", e);
            }
            waitCallback = undefined;
        }
    }

    this.getBarInstance = () => {
        return bar;
    }

    this.init = (callback) => {
        bar.init(callback);
    }

    this.initAsync = async () => {
        return convertUpdateFnToAsync(this.init);
    }

    this.load = (callback) => {
        bar.load(callback);
    }

    this.loadAsync = async () => {
        return convertUpdateFnToAsync(this.load);
    }

    this.hasNewVersion = (callback) => {
        bar.hasNewVersion(callback);
    }

    this.loadVersion = (versionHash, callback) => {
        bar.loadVersion(versionHash, callback);
    }

    this.loadVersionAsync = async (versionHash) => {
        return convertUpdateFnToAsync(this.loadVersion, versionHash);
    }

    this.getLastHashLinkSSI = (callback) => {
        bar.getLastHashLinkSSI(callback);
    }

    this.getLastHashLinkSSIAsync = async () => {
        return convertGetFunctionToAsync(this.getLastHashLinkSSI);
    }

    this.getLatestAnchoredHashLink = (callback) => {
        bar.getLatestAnchoredHashLink(callback);
    }

    this.getLatestAnchoredHashLinkAsync = async () => {
        return convertGetFunctionToAsync(this.getLatestAnchoredHashLink);
    }

    this.getCurrentAnchoredHashLink = (callback) => {
        bar.getCurrentAnchoredHashLink(callback);
    }

    this.getCurrentAnchoredHashLinkAsync = async () => {
        return convertGetFunctionToAsync(this.getCurrentAnchoredHashLink);
    }

    this.getKeySSI = (keySSIType, callback) => {
        bar.getKeySSI(keySSIType, callback);
    }

    this.getKeySSIAsync = async (keySSIType) => {
        return convertGetFunctionToAsync(this.getKeySSI, keySSIType);
    }

    this.getKeySSIAsObject = (keySSIType, callback) => {
        bar.getKeySSIAsObject(keySSIType, callback);
    }

    this.getKeySSIAsObjectAsync = async (keySSIType) => {
        return convertGetFunctionToAsync(this.getKeySSIAsObject, keySSIType);
    }

    this.getKeySSIAsString = (keySSIType, callback) => {
        bar.getKeySSIAsString(keySSIType, callback);
    }

    this.getKeySSIAsStringAsync = async (keySSIType) => {
        return convertGetFunctionToAsync(this.getKeySSIAsString, keySSIType);
    }

    this.getCreationSSI = (plain) => {
        return bar.getCreationSSI(plain);
    }

    this.getUniqueIdAsync = async () => {
        return await bar.getUniqueIdAsync();
    }

    this.getAnchorIdSync = () => {
        return bar.getAnchorIdSync();
    }

    this.getAnchorId = (callback) => {
        bar.getAnchorId(callback);
    }

    this.addFiles = (files, barPath, options, callback) => {
        preventUpdateOutsideBatch(bar.addFiles, files, barPath, options, callback);
    }

    this.addFilesAsync = async (files, barPath, options) => {
        return convertUpdateFnToAsync(this.addFiles, files, barPath, options);
    }

    this.appendToFile = (barPath, data, options, callback) => {
        preventUpdateOutsideBatch(bar.appendToFile, barPath, data, options, callback);
    }

    this.appendToFileAsync = async (barPath, data, options) => {
        return convertUpdateFnToAsync(this.appendToFile, barPath, data, options);
    }

    this.dsuLog = (message, callback) => {
        bar.dsuLog(message, callback);
        // preventUpdateOutsideBatch(bar.dsuLog, message, callback);
    }

    this.dsuLogAsync = async (message) => {
        return convertUpdateFnToAsync(this.dsuLog, message);
    }

    this.setValidationRules = (rules) => {
        bar.setValidationRules(rules);
    }

    this.setAnchoringEventListener = (listener) => {
        bar.setAnchoringEventListener(listener);
    }

    this.setDecisionCallback = (callback) => {
        bar.setDecisionCallback(callback);
    }

    this.getAnchoringStrategy = () => {
        return bar.getAnchoringStrategy();
    }

    this.addFolder = (fsFolderPath, barPath, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.addFolder, fsFolderPath, barPath, options, callback);
    }

    this.addFolderAsync = async (fsFolderPath, barPath, options) => {
        return convertUpdateFnToAsync(this.addFolder, fsFolderPath, barPath, options);
    }

    this.addFile = (fsFilePath, barPath, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.addFile, fsFilePath, barPath, options, callback);
    }

    this.addFileAsync = async (fsFilePath, barPath, options) => {
        return convertUpdateFnToAsync(this.addFile, fsFilePath, barPath, options);
    }

    this.readFile = (fileBarPath, options, callback) => {
        bar.readFile(fileBarPath, options, callback)
    }

    this.readFileAsync = async (fileBarPath, options) => {
        return convertGetFunctionToAsync(this.readFile, fileBarPath, options);
    }

    this.createReadStream = (fileBarPath, options, callback) => {
        bar.createReadStream(fileBarPath, options, callback);
    }

    this.createReadStreamAsync = async (fileBarPath, options) => {
        return convertGetFunctionToAsync(this.createReadStream, fileBarPath, options);
    }

    this.createBigFileReadStreamWithRange = (fileBarPath, range, options, callback) => {
        bar.createBigFileReadStreamWithRange(fileBarPath, range, options, callback);
    }

    this.createBigFileReadStreamWithRangeAsync = async (fileBarPath, range, options) => {
        return convertGetFunctionToAsync(this.createBigFileReadStreamWithRange, fileBarPath, range, options);
    }

    this.extractFolder = (fsFolderPath, barPath, options, callback) => {
        bar.extractFolder(fsFolderPath, barPath, options, callback);
    }

    this.extractFolderAsync = async (fsFolderPath, barPath, options) => {
        return convertGetFunctionToAsync(this.extractFolder, fsFolderPath, barPath, options);
    }

    this.extractFile = (fsFilePath, barPath, options, callback) => {
        bar.extractFile(fsFilePath, barPath, options, callback);
    }

    this.extractFileAsync = async (fsFilePath, barPath, options) => {
        return convertGetFunctionToAsync(this.extractFile, fsFilePath, barPath, options);
    }
    const createFunctionCallObject = (callerInstance, actionName, fn, args) => {
        return {
            callerInstance, actionName, fn, args
        };

    }

    const preventUpdateOutsideBatch = (updateFn, ...args) => {
        if ($$.LEGACY_BEHAVIOUR_ENABLED) {
            return updateFn(...args);
        }

        if (!this.batchInProgress()) {
            const callback = args.pop();
            return callback(Error("Batch not started. Use safeBeginBatch() or safeBeginBatchAsync before calling this method."));
        }

        updateFn(...args);
    }

    this.writeFile = (path, data, options, callback) => {
        if (typeof data === "function") {
            callback = data;
            data = undefined;
            options = undefined;
        }

        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.writeFile, path, data, options, callback);
    }

    this.writeFileAsync = async (path, data, options) => {
        return convertUpdateFnToAsync(this.writeFile, path, data, options);
    }

    this.embedFile = (path, data, options, callback) => {
        if (typeof data === "function") {
            callback = data;
            data = undefined;
            options = undefined;
        }

        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.embedFile, path, data, options, callback);
    }

    this.embedFileAsync = async (path, data, options) => {
        return convertUpdateFnToAsync(this.embedFile, path, data, options);
    }

    this.writeFileFromBricks = (path, bricks, options, callback) => {
        bar.writeFileFromBricks(path, bricks, options, callback);
    }

    this.writeFileFromBricksAsync = async (path, bricks, options) => {
        return convertUpdateFnToAsync(this.writeFileFromBricks, path, bricks, options);
    }

    this.appendBigFileBrick = (path, newSizeSSI, brick, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.appendBigFileBrick, path, newSizeSSI, brick, options, callback);
    }

    this.appendBigFileBrickAsync = async (path, newSizeSSI, brick, options) => {
        return convertUpdateFnToAsync(this.appendBigFileBrick, path, newSizeSSI, brick, options);
    }

    this.getBigFileBricksMeta = (path, options, callback) => {
        bar.getBigFileBricksMeta(path, options, callback)
    }

    this.delete = (path, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.delete, path, options, callback);
    }

    this.deleteAsync = async (path, options) => {
        return convertUpdateFnToAsync(this.delete, path, options);
    }


    this.rename = (srcPath, dstPath, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.rename, srcPath, dstPath, options, callback);
    }

    this.renameAsync = async (srcPath, dstPath, options) => {
        return convertUpdateFnToAsync(this.rename, srcPath, dstPath, options);
    }

    this.listFiles = (path, options, callback) => {
        bar.listFiles(path, options, callback);
    }

    this.listFolders = (path, options, callback) => {
        bar.listFolders(path, options, callback);
    }

    this.createFolder = (barPath, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.createFolder, barPath, options, callback);
    }

    this.createFolderAsync = async (barPath, options) => {
        return convertUpdateFnToAsync(this.createFolder, barPath, options);
    }

    this.readDir = (folderPath, options, callback) => {
        bar.readDir(folderPath, options, callback);
    }

    this.readDirAsync = async (folderPath, options) => {
        return convertGetFunctionToAsync(this.readDir, folderPath, options);
    }

    this.cloneFolder = (srcPath, destPath, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.cloneFolder, srcPath, destPath, options, callback);
    }

    this.cloneFolderAsync = async (srcPath, destPath, options) => {
        return convertUpdateFnToAsync(this.cloneFolder, srcPath, destPath, options);
    }

    this.mount = (path, archiveSSI, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = undefined;
        }

        preventUpdateOutsideBatch(bar.mount, path, archiveSSI, options, callback);
    }

    this.mountAsync = async (path, archiveSSI, options) => {
        return convertUpdateFnToAsync(this.mount, path, archiveSSI, options);
    }

    this.unmount = (path, callback) => {
        preventUpdateOutsideBatch(bar.unmount, path, callback);
    };

    this.unmountAsync = async (path) => {
        return convertUpdateFnToAsync(this.unmount, path);
    }

    this.listMountedDSUs = (path, callback) => {
        bar.listMountedDSUs(path, callback);
    };

    this.listMountedDSUsAsync = async (path) => {
        return convertGetFunctionToAsync(this.listMountedDSUs, path);
    }

    this.listMountedDossiers = this.listMountedDSUs;

    this.hasUnanchoredChanges = (callback) => {
        bar.hasUnanchoredChanges(callback);
    }

    this.hasUnanchoredChangesAsync = async () => {
        return convertGetFunctionToAsync(this.hasUnanchoredChanges);
    }

    this.getArchiveForPath = (path, callback) => {
        bar.getArchiveForPath(path, callback);
    }

    this.getArchiveForPathAsync = async (path) => {
        return convertGetFunctionToAsync(this.getArchiveForPath, path);
    }

    this.stat = (path, callback) => {
        bar.stat(path, callback);
    }

    this.statAsync = async (path) => {
        return convertGetFunctionToAsync(this.stat, path);
    }

    this.safeBeginBatch = (wait, callback) => {
        console.trace("Safe begin batch ", dsuId);
        if (typeof wait === "function") {
            callback = wait;
            wait = false;
        }
        if (bar.batchInProgress()) {
            if (wait) {
                if(waitCallback){
                    return callback(Error("SafeBeginBatch is already requested in wait mode for this instance."));
                }
                waitCallback = callback;
                return;
            }
            return callback(Error("This DSU instance is already in batch mode!"));
            // return callback();
        }

        if (dsuInstancesRegistry.batchInProgress(this.getAnchorIdSync())) {
            return callback(Error("Another DSU instance is already in batch mode. Please wait for it to finish."));
        }

        this.refresh((err)=>{
            if(err){
                return callback(err);
            }
            callback(undefined, this.beginBatch());
        });
    }

    this.safeBeginBatchAsync = async (wait) => {
        return convertGetFunctionToAsync(this.safeBeginBatch, wait);
    }

    this.startOrAttachBatch = (callback) => {
        if (!this.batchInProgress && dsuInstancesRegistry.batchInProgress(this.getAnchorIdSync())) {
            return callback(Error("Another instance of the LegacyDSU is currently in batch."));
        }

        if(this.batchInProgress()){
            let attachedBatchId = generateBatchId();
            console.trace("attaching batch id ", attachedBatchId, dsuId);
            inProgressBatches.add(attachedBatchId);
            return callback(undefined, attachedBatchId);
        }

        return callback(undefined, this.beginBatch());
    }

    this.startOrAttachBatchAsync = async () => {
        return convertGetFunctionToAsync(this.startOrAttachBatch);
    }

    function generateBatchId(){
        return require("opendsu").loadApi("crypto").encodeBase58(require("opendsu").loadApi("crypto").generateRandom(32));
    }

    this.beginBatch = () => {
        bar.beginBatch();
        const id = generateBatchId();
        console.trace("Adding batch id", id, dsuId);
        inProgressBatches.add(id);
        return id;
    }

    this.batch = (batch, callback) => {
        bar.batch(batch, callback);
    }

    this.batchInProgress = () => {
        return bar.batchInProgress();
    }

    this.cancelBatch = (batchId, callback) => {

        if(typeof batchId === "function"){
            callback = batchId;
            batchId = undefined;
        }

        console.trace("Cancel batch with id: ", batchId, dsuId);

        if(inProgressBatches.size === 0){
            return callback(Error("Unable to cancel a batch that seems to don't be in batch mode"));
        }

        if(!batchId && inProgressBatches.size > 1){
            return callback(Error("Cancel batch was called without batchId"));
        }

        if(!batchId && inProgressBatches.size === 1){
            inProgressBatches.clear();
        }

        if(batchId){
            if(inProgressBatches.has(batchId)){
                console.trace("Deleting batch id", batchId, dsuId);
                inProgressBatches.delete(batchId);
                if(inProgressBatches.size){
                    return callback(Error("Unable to cancel because of another attached batch is in progress."));
                }
            }else{
                return callback(Error("Invalid batchId"));
            }
        }
        bar.cancelBatch(err => {
            if (err) {
                return callback(err);
            }
            dsuInstancesRegistry.notifyBatchCancelled(bar.getAnchorIdSync(), callback);
        });
    }

    this.cancelBatchAsync = async () => {
        return convertUpdateFnToAsync(this.cancelBatch);
    }

    this.setMergeConflictsHandler = (handler) => {
        bar.setMergeConflictsHandler(handler);
    }

    this.commitBatch = (onConflict, batchId, callback) => {
        let args = [];

        if(onConflict) {
            args.push(onConflict);
        }

        if(batchId){
            args.push(batchId);
        }

        if(callback){
            args.push(callback);
        }

        switch(args.length){
            case 3:
                break;
            case 2:
                callback = args[1];
                if(typeof onConflict === "function"){
                    batchId = undefined;
                }else{
                    onConflict = undefined;
                    batchId = args[0];
                }
                break;
            case 1:
                callback = args[0];
                onConflict = undefined;
                batchId = undefined;
                break;
            default:
                throw Error("Wrong api usage");
        }

        console.trace("Commit batch with id: ", batchId, dsuId);

        if(inProgressBatches.size === 0){
            return callback(Error("Unable to commit a batch that seems to don't be in batch mode"));
        }

        if(!batchId && inProgressBatches.size > 1){
            return callback(Error("startOrAttachBatch mode is active but commit batch was called without batchId."));
        }

        if(!batchId && inProgressBatches.size === 1){
            console.log("Possible dev error: forgot to pass the batchId on the commit method");
            inProgressBatches.clear();
        }

        if(batchId){
            if(inProgressBatches.has(batchId)){
                console.trace("Deleting at commit batch id", batchId, dsuId);
                inProgressBatches.delete(batchId);
                if(inProgressBatches.size){
                    console.debug(`Closing attachedBatch ${batchId}`);
                    return callback();
                }
            }else{
                return callback(Error("Invalid batchId"));
            }
        }

        bar.commitBatch(onConflict, err => {
            if (err) {
                return dsuInstancesRegistry.notifyBatchCommitted(bar.getAnchorIdSync(), (error)=>{
                    //we log this second error because we want to exit with the first one...
                    console.log("Caught an error when notifying other LegacyDSU instances", error);
                    return callback(err);
                });
            }

            //if recovery mode is active for the current bar, and we have a success we mark it
            let {
                unmarkAnchorForRecovery
            } = require("opendsu").loadApi("anchoring").getAnchoringX();
            unmarkAnchorForRecovery(bar.getAnchorIdSync());

            dsuInstancesRegistry.notifyBatchCommitted(bar.getAnchorIdSync(), callback);
        });
    };

    this.commitBatchAsync = async (...args) => {
        return convertUpdateFnToAsync(this.commitBatch, ...args);
    }

    this.refresh = (callback) => {
        if(inProgressBatches.size >= 1){
            console.trace("preventing refresh on dsu", dsuId);
            return callback(Error("DSU is in batch mode. Refresh is not possible"));
        }
        return dsuInstancesRegistry.loadNewBarInstance(bar, (err, newInstance)=>{
            if(err){
                return callback(err);
            }
            bar = newInstance;
            callback(undefined, bar);
        });
    };

    this.refreshAsync = async () => {
        return convertGetFunctionToAsync(this.refresh);
    }

    this.getSSIForMount = (mountPoint, callback) => {
        bar.getSSIForMount(mountPoint, callback);
    }

    return this;
}

module.exports = LegacyDSU;