import { ProcessPriority } from "../kernel/constants";
import { ProcessSleepByProcess, ProcessSleepByTime } from "OS/kernel/process";
export interface Process {
    pid: number;
    parentPID: number;
    status: number;
    classPath(): string;
    priority: ProcessPriority;
    sleepInfo?: ProcessSleepByTime | ProcessSleepByProcess;
    memory: any;
    setMemory(memory: any): void;
    run(): number;
    setup(..._: any[]): Process;
    //run(forever?: boolean): Readonly<S & I>;
    stop(signal: number): number;
}
