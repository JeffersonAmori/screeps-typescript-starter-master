import * as Kernel from "./kernel";
import { ProcessPriority } from "./constants";
import { ProcessStatus } from "./process-status";
import { ProcessSleep } from "../typings/process-sleep";
import { MachineInputSource, MachineState, StateMachine } from "when-ts";
type ConcreteProcess<MachineState, MachineInputSource> = { new(pid: number, parentPID: number, priority?: ProcessPriority): Process<MachineState, MachineInputSource> };
type DependencyInfo = [ConcreteProcess<MachineState, MachineInputSource>, ProcessSetupCallback];
type ProcessSetupCallback = (p: Process<MachineState, MachineInputSource>) => void

export abstract class Process<S extends MachineState, I extends MachineInputSource = MachineInputSource> extends StateMachine<S, I> {
    public status: number;
    public classPath(): string {
        return "None";
    };
    public sleepInfo?: ProcessSleep;
    public priority: ProcessPriority;
    public memory: any;
    protected deps: DependencyInfo[] = [];
    protected kernel = Kernel;
    // public static reloadFromTable(pid: number, parentPID: number, priority = ProcessPriority.LowPriority) {
    //     const p = new Process<MachineState, MachineInputSource>()
    // }
    constructor(public pid: number,
        public parentPID: number,
        priority = ProcessPriority.LowPriority) {

        super(<S>{});
        this.status = ProcessStatus.ALIVE;
        this.priority = priority;
    };

    public setMemory(memory: any): void {
        this.memory = memory;
    };

    public stop(signal: number) {
        this.kernel.killProcess(this.pid);
        return signal;
    }

    public setup(..._: any[]) { };

    public registerDependency(p: ConcreteProcess<MachineState, MachineInputSource>, processSetup: ProcessSetupCallback) {
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
