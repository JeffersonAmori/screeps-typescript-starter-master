import { MachineInputSource, MachineState, StateMachine } from "when-ts";
import { ProcessPriority } from "../kernel/constants";
import { ProcessSleep } from "./process-sleep";
export interface Process<S extends MachineState, I extends MachineInputSource = MachineInputSource> extends StateMachine<S, I> {
    pid: number;
    parentPID: number;
    status: number;
    classPath(): string;
    priority: ProcessPriority;
    sleepInfo?: ProcessSleep;
    memory: any;
    setMemory(memory: any): void;
    //run(): number;
    //run(forever?: boolean): Readonly<S & I>;
    stop(signal: number): number;
}
