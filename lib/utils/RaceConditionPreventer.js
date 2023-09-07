const DSUInstancesRegistry = require("../DSUFactoryRegistry/DSUInstancesRegistry");

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
    self.loadNewBarInstance = DSUInstancesRegistry.prototype.loadNewBarInstance;

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

    const functionCallHasCallback = (fnCallObj) => {
        return fnCallObj.args && typeof fnCallObj.args[fnCallObj.args.length - 1] === "function";
    }

    self.executeOrDelayAction = (key, fnCallObj) => {
        const getCommitBatchCallback = (callback) => {
            return (...args) => {
                self.notifyBatchCommitted(key, (err) => {
                    if (err) {
                        return callback(err);
                    }

                    self.executeDelayedActions(key, () => callback(...args));
                });
            }
        }

        const executeFn = () => {
            if (fnCallObj.args) {
                if (functionCallHasCallback(fnCallObj)) {
                    const callback = fnCallObj.args[fnCallObj.args.length - 1];
                    if (fnCallObj.actionName === "commitBatch") {
                        fnCallObj.args[fnCallObj.args.length - 1] = getCommitBatchCallback(callback);
                    }
                }
                return fnCallObj.fn(...fnCallObj.args);
            }
            return fnCallObj.fn();
        }

        if (!self.batchInProgress(key)) {
            return executeFn();
        }

        if (fnCallObj.callerInstance.batchInProgress()) {
            return executeFn();
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
        if (fnCallObj.args && typeof fnCallObj.args[fnCallObj.args.length - 1] === "function") {
            fnCallObj.args[fnCallObj.args.length - 1]();
        }
    }

    const getNoTasks = (key, instanceIndex) => {
        let noTasks = 0;
        const functionCalls = delayedFunctionCalls[key][instanceIndex];
        for (let i = 0; i < functionCalls.length; i++) {
            if (functionCalls[i].args && typeof functionCalls[i].args[functionCalls[i].args.length - 1] === "function") {
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
            if (call.args) {
                let cb = call.args[call.args.length - 1];
                if (typeof cb === "function") {
                    call.args[call.args.length - 1] = (...args) => {
                        cb(...args);
                        taskCounter.decrement();
                    }
                }

                instance[call.actionName](...call.args);
            } else {
                instance[call.actionName]();
            }
        });
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
                let {currentContinuation, curInst} = possibleContinuations[0];               
                if(curInst === myInstance){
                    if(typeof curInst !== "function"){
                        console.error(Error(`Failed to execution continuation because is not a function: `, continuation));
                    }
                    try{
                        currentContinuation(isVirtual);
                        isVirtual = true;
                    } catch(err){
                        console.error(Error("Continution functions should not throw exceptions. Ignoring code, possible invalid satates."))                        
                    }  
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
            let {myCont, myInstance} = possibleContinuations[0];                 
            executeAllContinuations(myInstance);
        }
        return true;
    }

    async function dumpBatchInfo(){
        let opendsu = require("opendsu");
        let keySSI = opendsu.loadApi("keyssi");
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
            setInterval(()=>{
                console.log("Registry status===============================");
                console.log(`\tCurrent locks ${JSON.stringify(locks)}`);
                console.log(`\tContinuations on ${JSON.stringify(Object.keys(continuations))}`);
                dumpBatchInfo();
                console.log("=============================================");
            }, 30*1000);
        }
    }

    self.isLocked = (anchorId) =>{
        return !!locks[anchorId];
    }

    self.notifyBatchCancelled = self.notifyBatchCommitted;
}

module.exports = RaceConditionPreventer;