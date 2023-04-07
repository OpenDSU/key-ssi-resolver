const BarFactory = require("../DSUFactoryRegistry/BarFactory");

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

    this.setBarInstance = (_barInstance) => {
        bar = _barInstance;
    }

    this.getBarInstance = () => {
        return bar;
    }

    this.init = (callback) => {
        bar.init(callback);
    }

    this.load = (callback) => {
        bar.load(callback);
    }

    this.loadVersion = (versionHash, callback) => {
        bar.loadVersion(versionHash, callback);
    }

    this.getLastHashLinkSSI = (callback) => {
        bar.getLastHashLinkSSI(callback);
    }

    this.getLatestAnchoredHashLink = (callback) => {
        bar.getLatestAnchoredHashLink(callback);
    }

    this.getCurrentAnchoredHashLink = (callback) => {
        bar.getCurrentAnchoredHashLink(callback);
    }

    this.getKeySSI = (keySSIType, callback) => {
        bar.getKeySSI(keySSIType, callback);
    }

    this.getKeySSIAsObject = (keySSIType, callback) => {
        bar.getKeySSIAsObject(keySSIType, callback);
    }

    this.getKeySSIAsString = (keySSIType, callback) => {
        bar.getKeySSIAsString(keySSIType, callback);
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

    this.appendToFile = (barPath, data, options, callback) => {
        bar.appendToFile(barPath, data, options, callback);
    }

    this.dsuLog = (message, callback) => {
        bar.dsuLog(message, callback);
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

    this.addFile = (fsFilePath, barPath, options, callback) => {
        bar.addFile(fsFilePath, barPath, options, callback)
    }

    this.readFile = (fileBarPath, options, callback) => {
        bar.readFile(fileBarPath, options, callback)
    }

    this.createReadStream = (fileBarPath, options, callback) => {
        bar.createReadStream(fileBarPath, options, callback);
    }

    this.createBigFileReadStreamWithRange = (fileBarPath, range, options, callback) => {
        bar.createBigFileReadStreamWithRange(fileBarPath, range, options, callback);
    }

    this.extractFolder = (fsFolderPath, barPath, options, callback) => {
        bar.extractFolder(fsFolderPath, barPath, options, callback);
    }

    this.extractFile = (fsFilePath, barPath, options, callback) => {
        bar.extractFile(fsFilePath, barPath, options, callback);
    }

    const createFunctionCallObject = (callerInstance, actionName, fn, args) => {
        return {
            callerInstance,
            actionName,
            fn,
            args
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

        const args = [path, data, options, callback];
        const fnCallObj = createFunctionCallObject(this, "writeFile", (...args) => {
            bar.writeFile(...args);
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
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

        const args = [path, data, options, callback];
        const fnCallObj = createFunctionCallObject(this, "embedFile", (...args) => {
            bar.embedFile(...args);
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    }

    this.writeFileFromBricks = (path, bricks, options, callback) => {
        bar.writeFileFromBricks(path, bricks, options, callback)
    }

    this.appendBigFileBrick = (path, newSizeSSI, brick, options, callback) => {
        bar.appendBigFileBrick(path, newSizeSSI, brick, options, callback)
    }

    this.getBigFileBricksMeta = (path, options, callback) => {
        bar.getBigFileBricksMeta(path, options, callback)
    }

    this.delete = (path, options, callback) => {
        const args = [path, options, callback];
        const fnCallObj = createFunctionCallObject(this, "delete", (...args) => {
            bar.delete(...args);
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    }

    this.rename = (srcPath, dstPath, options, callback) => {
        const args = [srcPath, dstPath, options, callback];
        const fnCallObj = createFunctionCallObject(this, "rename", (...args) => {
            bar.rename(...args);
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    }

    this.listFiles = (path, options, callback) => {
        bar.listFiles(path, options, callback);
    }

    this.listFolders = (path, options, callback) => {
        bar.listFolders(path, options, callback);
    }

    this.createFolder = (barPath, options, callback) => {
        const args = [barPath, options, callback];
        const fnCallObj = createFunctionCallObject(this, "createFolder", (...args) => {
            bar.createFolder(...args);
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    }

    this.readDir = (folderPath, options, callback) => {
        bar.readDir(folderPath, options, callback);
    }

    this.cloneFolder = (srcPath, destPath, options, callback) => {
        bar.cloneFolder(srcPath, destPath, options, callback);
    }

    this.mount = (path, archiveSSI, options, callback) => {
        const args = [path, archiveSSI, options, callback];
        const fnCallObj = createFunctionCallObject(this, "mount", (...args) => {
            bar.mount(...args);
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    }

    this.unmount = (path, callback) => {
        const args = [path, callback];
        const fnCallObj = createFunctionCallObject(this, "unmount", (...args) => {
            bar.unmount(...args);
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    };

    this.listMountedDSUs = (path, callback) => {
        bar.listMountedDSUs(path, callback);
    };

    this.listMountedDossiers = this.listMountedDSUs;

    this.hasUnanchoredChanges = (callback) => {
        bar.hasUnanchoredChanges(callback);
    }

    this.getArchiveForPath = (path, callback) => {
        bar.getArchiveForPath(path, callback);
    }

    this.stat = (path, callback) => {
        bar.stat(path, callback);
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
        const args = [callback];
        const fnCallObj = createFunctionCallObject(this, "commitBatch", (...args) => {
            bar.commitBatch(...args)
        }, args);
        dsuInstancesRegistry.executeOrDelayAction(bar.getAnchorIdSync(), fnCallObj);
    };

    this.refresh = (callback) => {
        loadNewBarInstance(callback);
    };

    return this;
}

module.exports = LegacyDSU;