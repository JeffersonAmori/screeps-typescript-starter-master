//https://github.com/NhanHo/screeps-kernel

import { ProcessStatus } from "./process-status";

import { ProcessPriority } from "./constants";
import { Process } from "../typings/process";
import { Lookup as processLookup } from "./process";
import { MachineInputSource, MachineState } from "when-ts";

let ticlyQueue: Process<MachineState, MachineInputSource>[] = [];
let ticlyLastQueue: Process<MachineState, MachineInputSource>[] = [];
let lowPriorityQueue: Process<MachineState, MachineInputSource>[] = [];

export let processTable: { [pid: string]: Process<MachineState, MachineInputSource> } = {};

export let reboot = function () {
    ticlyQueue = [];
    ticlyLastQueue = [];
    lowPriorityQueue = [];
    processTable = {};
};

let getFreePid = function () {
    Memory.pidCounter = Memory.pidCounter || 0;
    while (getProcessById(Memory.pidCounter)) {
        Memory.pidCounter += 1;
    }
    return Memory.pidCounter;
};

export let garbageCollection = function () {
    Memory.processMemory = _.pick(Memory.processMemory,
        (_: any, k: string) => (processTable[k]));
}
export let addProcess = function <T extends Process<MachineState, MachineInputSource>>(p: T, priority = ProcessPriority.LowPriority) {
    let pid = getFreePid();
    p.pid = pid;
    p.priority = priority;
    processTable[p.pid] = p;
    Memory.processMemory[pid] = {};
    p.setMemory(getProcessMemory(pid));
    p.status = ProcessStatus.ALIVE;
    return p;
};

export let killProcess = function (pid: number) {
    if (pid === 0) {
        console.log("ABORT! ABORT! Why are you trying to kill init?!");
        return -1;
    }
    processTable[pid].status = ProcessStatus.DEAD;
    Memory.processMemory[pid] = undefined;

    // When a process is killed, we also need to kill all of its child processes
    console.log("Shutting down process with pid:" + pid);
    for (let otherPid in processTable) {
        const process = processTable[pid];

        if ((process.parentPID === parseInt(otherPid, 10)) &&
            (process.status !== ProcessStatus.DEAD)) {
            killProcess(process.pid);
        }
    }
    return pid;
};

export let sleepProcess = function (p: Process<MachineState, MachineInputSource>, ticks: number) {
    p.status = ProcessStatus.SLEEP;
    p.sleepInfo = { start: Game.time, duration: ticks };
    return p;
}

export let getProcessById = function (pid: number): Process<MachineState, MachineInputSource> | null {
    return processTable[pid];
};

export let storeProcessTable = function () {
    let aliveProcess = _.filter(_.values(processTable),
        (p: Process<MachineState, MachineInputSource>) => p.status !== ProcessStatus.DEAD);

    Memory.processTable = _.map(aliveProcess,
        (p: Process<MachineState, MachineInputSource>) => [p.pid, p.parentPID, p.constructor.name, p.priority, p.sleepInfo]);
};

export let getProcessMemory = function (pid: number) {
    Memory.processMemory = Memory.processMemory || {};
    Memory.processMemory[pid] = Memory.processMemory[pid] || {};
    return Memory.processMemory[pid];
};

let runOneQueue = function (queue: Process<MachineState, MachineInputSource>[]) {
    while (queue.length > 0) {
        let process = queue.pop();
        while (process) {
            try {
                if (process.parentPID > 0) {
                    let parent = getProcessById(process.parentPID);
                    if (!parent) {
                        killProcess(process.pid);
                    }
                }
                if ((process.status === ProcessStatus.SLEEP) &&
                    ((process.sleepInfo!.start + process.sleepInfo!.duration) < Game.time) &&
                    (process.sleepInfo!.duration !== -1)) {
                    process.status = ProcessStatus.ALIVE;
                    process.sleepInfo = undefined;
                }
                if (process.status === ProcessStatus.ALIVE) {
                    process.run();
                }
            } catch (e: any) {
                console.log("Fail to run process:" + process.pid);
                console.log(e.message);
                console.log(e.stack);
            }
            process = queue.pop();
        }
    }

}
export let run = function () {
    runOneQueue(ticlyQueue);
    runOneQueue(ticlyLastQueue);
    runOneQueue(lowPriorityQueue);
};

export let loadProcessTable = function () {
    reboot();
    Memory.processTable = Memory.processTable || [];
    let storedTable = Memory.processTable;
    for (let item of storedTable) {
        let [pid, parentPID, classPath, priority, ...remaining] = item;
        try {
            // let processClass = processLookup.getProcess(classPath);
            // if (processClass === null) {
            //     console.log("Fail to lookup process: " + classPath);
            //     continue;
            // }
            let memory = getProcessMemory(pid);
            let p = eval(`new ${classPath}(${pid}, ${parentPID}, ${priority})`) as Process<MachineState, MachineInputSource>
            //let p = new processClass(pid, parentPID, priority) as Process;
            p.setMemory(memory);
            console.log(`PID: ${p.pid} | CreepID: ${memory.creepId}`);
            if (!memory.creepId) {
                killProcess(p.pid);
                return;
            }

            p.setInitialState({ creep: Game.getObjectById<Creep>(memory.creepId) });
            processTable[p.pid] = p;
            const sleepInfo = remaining.pop();
            if (sleepInfo) {
                p.sleepInfo = sleepInfo;

                p.status = ProcessStatus.SLEEP;
            }
            if (priority === ProcessPriority.Ticly) {
                ticlyQueue.push(p);
            }

            if (priority === ProcessPriority.TiclyLast) {
                ticlyLastQueue.push(p);
            }

            if (priority === ProcessPriority.LowPriority) {
                lowPriorityQueue.push(p);
            }
        } catch (e: any) {
            console.log("Error when loading: " + classPath + ' | ' + e.message);
        }
    }
};

export let getChildProcess = function (p: Process<MachineState, MachineInputSource>) {
    let result: Process<MachineState, MachineInputSource>[] = [];
    for (let i in processTable) {
        let process = processTable[i];
        if (process.parentPID === p.pid) {
            result.push(process);
        }
    }
    return result;
}
