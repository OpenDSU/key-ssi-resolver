function LegacyDSU(bar, dsuInstancesRegistry) {
    const BarFactory = require("../DSUFactoryRegistry/BarFactory");
    const barFactoryInstance = new BarFactory();
    const loadNewBarInstance = (callback) => {
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

    const convertUpdateFnToAsync = (updateFn, ...args) => {
        const callback = args.pop();
        if (!this.batchInProgress()) {
            return callback(Error("No batch has been started"));
        }

        return $$.promisify(updateFn)(...args);
    }

    const convertGetFunctionToAsync = (getFn, ...args) => {
        const callback = args.pop();
        return $$.promisify(getFn)(...args);
    }

    this.setBarInstance = (_barInstance) => {
        bar = _barInstance;
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
        bar.addFiles(files, barPath, options, callback);
    }

    this.addFilesAsync = async (files, barPath, options) => {
        return convertUpdateFnToAsync(this.addFiles, files, barPath, options);
    }

    this.appendToFile = (barPath, data, options, callback) => {
        bar.appendToFile(barPath, data, options, callback);
    }

    this.appendToFileAsync = async (barPath, data, options) => {
        return convertUpdateFnToAsync(this.appendToFile, barPath, data, options);
    }

    this.dsuLog = (message, callback) => {
        bar.dsuLog(message, callback);
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
        bar.addFolder(fsFolderPath, barPath, options, callback);
    }

    this.addFolderAsync = async (fsFolderPath, barPath, options) => {
        return convertUpdateFnToAsync(this.addFolder, fsFolderPath, barPath, options);
    }

    this.addFile = (fsFilePath, barPath, options, callback) => {
        bar.addFile(fsFilePath, barPath, options, callback)
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

        bar.writeFile(path, data, options, callback);
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

        bar.embedFile(path, data, options, callback);
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
        bar.appendBigFileBrick(path, newSizeSSI, brick, options, callback)
    }

    this.appendBigFileBrickAsync = async (path, newSizeSSI, brick, options) => {
        return convertUpdateFnToAsync(this.appendBigFileBrick, path, newSizeSSI, brick, options);
    }

    this.getBigFileBricksMeta = (path, options, callback) => {
        bar.getBigFileBricksMeta(path, options, callback)
    }

    this.delete = (path, options, callback) => {
        bar.delete(path, options, callback);
    }

    this.deleteAsync = async (path, options) => {
        return convertUpdateFnToAsync(this.delete, path, options);
    }


    this.rename = (srcPath, dstPath, options, callback) => {
        bar.rename(srcPath, dstPath, options, callback);
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
        bar.createFolder(barPath, options, callback);
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
        bar.cloneFolder(srcPath, destPath, options, callback);
    }

    this.cloneFolderAsync = async (srcPath, destPath, options) => {
        return convertUpdateFnToAsync(this.cloneFolder, srcPath, destPath, options);
    }

    this.mount = (path, archiveSSI, options, callback) => {
        bar.mount(path, archiveSSI, options, callback);
    }

    this.mountAsync = async (path, archiveSSI, options) => {
        return convertUpdateFnToAsync(this.mount, path, archiveSSI, options);
    }

    this.unmount = (path, callback) => {
        bar.unmount(path, callback);
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

    this.safeBeginBatch = (callback) => {
        if (dsuInstancesRegistry.batchInProgress(this.getAnchorIdSync())) {
            return callback(Error("Another DSU instance is already in batch mode. Please wait for it to finish."));
        }

        bar.beginBatch();
        callback();
    }

    this.safeBeginBatchAsync = async () => {
        return convertGetFunctionToAsync(this.safeBeginBatch);
    }

    this.beginBatch = () => {
        const fnCallObj = createFunctionCallObject(this, "beginBatch", () => {
            bar.beginBatch()
        });
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    }

    this.batch = (batch, callback) => {
        bar.batch(batch, callback);
    }

    this.batchInProgress = () => {
        return bar.batchInProgress();
    }

    this.cancelBatch = (callback) => {
        bar.cancelBatch(callback)
    }

    this.cancelBatchAsync = async () => {
        return convertUpdateFnToAsync(this.cancelBatch);
    }

    this.setMergeConflictsHandler = (handler) => {
        bar.setMergeConflictsHandler(handler);
    }

    this.enableAnchoringNotifications = (status, options, callback) => {
        bar.enableAnchoringNotifications(status, options, callback);
    }

    this.enableAutoSync = (status, options, callback) => {
        bar.enableAutoSync(status, options, callback);
    }

    this.commitBatch = (callback) => {
        bar.commitBatch(err => {
            if (err) {
                return callback(err);
            }
            dsuInstancesRegistry.notifyBatchCommitted(bar.getAnchorIdSync(), callback);
        });
    };

    this.commitBatchAsync = async () => {
        return convertUpdateFnToAsync(this.commitBatch);
    }

    this.refresh = (callback) => {
        loadNewBarInstance(callback);
    };

    this.refreshAsync = async () => {
        return convertGetFunctionToAsync(this.refresh);
    }

    return this;
}

module.exports = LegacyDSU;