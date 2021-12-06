import * as Kernel from "./kernel";
import { ProcessPriority } from "./constants";
import { ProcessStatus } from "./process-status";
type ConcreteProcess = { new(pid: number, parentPID: number, priority?: ProcessPriority): Process };
type DependencyInfo = [ConcreteProcess, ProcessSetupCallback];
type ProcessSetupCallback = (p: Process) => void

export abstract class Process {
    public status: number;
    public abstract classPath(): string;
    public sleepInfo?: ProcessSleepByTime | ProcessSleepByProcess;
    public priority: ProcessPriority;
    public memory: any;
    protected deps: DependencyInfo[] = [];
    protected kernel = Kernel;
    // public static reloadFromTable(pid: number, parentPID: number, priority = ProcessPriority.LowPriority) {
    //     const p = new Process()
    // }
    constructor(public pid: number,
        public parentPID: number,
        priority = ProcessPriority.LowPriority) {
        this.status = ProcessStatus.ALIVE;
        this.priority = priority;
    };

    public abstract run(): number;

    public setMemory(memory: any): void {
        this.memory = memory;
    };

    public stop(signal: number) {
        this.kernel.killProcess(this.pid);
        return signal;
    }

    public setup(..._: any[]) { };

    public registerDependency(p: ConcreteProcess, processSetup: ProcessSetupCallback) {
        let dependencyInfo: DependencyInfo = [p, processSetup];
        this.deps.push(dependencyInfo);
    }

    public runDeps() {
        let deps = this.memory.deps = this.memory.deps || {};
        for (let dep of this.deps) {
            let [processClass, callback] = dep;
            let t = new processClass(0, 0, 0);
            let classPath = t.classPath();
            if ((!deps[classPath]) || (!Kernel.getProcessById(deps[classPath]))) {
                let p = new processClass(0, this.pid);
                this.kernel.addProcess(p);
                callback.bind(this)(p);
                deps[classPath] = p.pid;
            }
        }
    }

}

const data: any = {}
export let Lookup = {
    addProcess: function (p: typeof Process) {
        data[p.name] = <any>p;
    },
    getProcess: function (id: string): any | null {
        return data[id];
    }
}

export class ProcessSleepByTime {
    start: number = 0;
    duration: number = -1;
}
export class ProcessSleepByProcess {
    pID: number = -1;
}
