const BarFactory = require("./../DSUFactoryRegistry/BarFactory");
const barFactoryInstance = new BarFactory();

function RaceConditionPreventer() {
    const TaskCounter = require("swarmutils").TaskCounter;

    const instancesRegistry = {};
    const self = this;

    self.put = (key, instance) => {
        if (!instancesRegistry[key]) {
            instancesRegistry[key] = new Set();
        }
        instance = instance ? new WeakRef(instance) : instance;
        instancesRegistry[key].add(instance);
    }

    self.set = self.put;
    self.loadNewBarInstance = (bar, callback) => {
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
    };

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

    self.beginBatch = (key, _instance) => {
        for (let instance of getDerefedInstances(key)) {
            if (instance && instance === _instance) {
                instance.beginBatch();
                return;
            }
        }
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

    self.notifyBatchCommitted = (key, callback) => {
        const instances = getDerefedInstances(key);
        if (!instances || !instances.size) {
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

    let continuations = {};
    //this api is meant only for beginBatch family of function, and it should not be used for anything else!
    self.waitUntilCanBeginBatch = (anchorId, continuation, instance)=> {
        if(!continuations[anchorId]){
            continuations[anchorId] = [];
        }
        continuations[anchorId].push({continuation, instance});
    }

    let locks = {};

    self.lockAnchorId = (anchorId, instance) => {
        if(locks[anchorId]){
            throw new Error(`AnchorId ${anchorId} already locked`);
        }
        locks[anchorId] = true;
        return true;
    }

    self.unlockAnchorId = (anchorId) => {
        let executeAllContinuations = (myInstance)=>{
            let isVirtual = false;
            for (let i = possibleContinuations.length - 1; i >= 0; i--) {
                let {continuation, instance} = possibleContinuations[i];
                if(instance === myInstance){
                    if(typeof continuation !== "function"){
                        console.error(Error(`Failed to execution continuation because is not a function: ${continuation ? continuation.toString(): continuation}`));
                    }
                    try{
                        continuation(isVirtual);
                        isVirtual = true;
                    } catch(err){
                        console.error(Error("Continuation functions should not throw exceptions. Ignoring code, possible invalid state."));
                    }
                    possibleContinuations.splice(i, 1);
                }  
          }
        } 
        if(!locks[anchorId]){
            throw new Error(`AnchorId ${anchorId} wasn't locked`);
        }
        locks[anchorId] = undefined;
        delete locks[anchorId];

        let possibleContinuations = continuations[anchorId];
        if(possibleContinuations && possibleContinuations.length > 0){
            let {instance} = possibleContinuations[0];
            executeAllContinuations(instance);
        }
        return true;
    }

    async function dumpBatchInfo(){
        let opendsu = require("opendsu");
        let keySSI = opendsu.loadApi("keyssi");
        const contentMaxLength = 100;
        let anchorIds = Object.keys(instancesRegistry);
        let envData = await $$.promisify(require("opendsu").loadApi("config").readEnvFile)();
        let sharedEnclaveId = envData["sharedEnclaveKeySSI"];
        if(sharedEnclaveId){
            sharedEnclaveId = await keySSI.parse(sharedEnclaveId).getAnchorIdAsync();
        }

        let mainEnclaveId = envData["enclaveKeySSI"];
        if(mainEnclaveId){
            mainEnclaveId = await keySSI.parse(mainEnclaveId).getAnchorIdAsync();
        }

        let mainDSU = await $$.promisify(require("opendsu").loadApi("sc").getMainDSU)();
        let mainAnchorId = await $$.promisify(mainDSU.getAnchorId)();

        for(let anchorId of anchorIds){
            let instances = instancesRegistry[anchorId];
            let noInstances = 0;
            let noInstancesInBatch = 0;
            let dsuContent = "secured";

            let type = "";
            let displayContent = false;
            switch (anchorId){
                case mainAnchorId:
                    type = "MAINDSU";
                    break;
                case sharedEnclaveId:
                    type = "SHARED_";
                    break;
                case mainEnclaveId:
                    type = "MAINENC";
                    break;
                default:
                    displayContent = true;
                    type = "UNK DSU";
            }

            for(let instance of instances){
                instance = instance.deref();
                if(instance){
                   noInstances++;
                   if(!dsuContent && displayContent){
                       try{
                           dsuContent = await $$.promisify(instance.listFiles, instance)("/");
                           if(dsuContent.length >= contentMaxLength){
                               dsuContent = dsuContent.slice(0, contentMaxLength-3) + "...";
                           }
                       }catch(err){
                           dsuContent = "content unavailable";
                       }
                   }
                   if(instance.batchInProgress()){
                       noInstancesInBatch++;
                   }
                }
            }

            let anchor = require("opendsu").loadApi("keyssi").parse(anchorId);
            if(anchor.getTypeName() === "cza" || !noInstances){
                continue;
            }

            anchor = anchor.getIdentifier(true);

            console.log(`\tAnchor ${anchor} [${type}]: ${noInstances} instances and ${noInstancesInBatch} in batch [Content: ${JSON.stringify(dsuContent)}]`);
        }
    }

    if($$.environmentType === "browser"){
        if(window.top.location !== window.location){
            if(!window.getLegacyDSUStats){
                console.log(">>> getLegacyDSUStats() available to be used when need it");
                window.getLegacyDSUStats = ()=>{
                    console.log("Registry status===============================");
                    console.log(`\tCurrent locks ${JSON.stringify(locks)}`);
                    console.log(`\tContinuations on ${JSON.stringify(Object.keys(continuations))}`);
                    dumpBatchInfo();
                    console.log("=============================================");
                }
            }
        }
    }

    self.isLocked = (anchorId) =>{
        return !!locks[anchorId];
    }

    self.notifyBatchCancelled = self.notifyBatchCommitted;
}

module.exports = RaceConditionPreventer;