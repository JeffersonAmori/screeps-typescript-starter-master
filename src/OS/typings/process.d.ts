import { ProcessPriority } from "../kernel/constants";
import { ProcessSleep } from "./process-sleep";
export interface Process {
    pid: number;
    parentPID: number;
    status: number;
    classPath(): string;
    priority: ProcessPriority;
    sleepInfo?: ProcessSleep;
    memory: any;
    setMemory(memory: any): void;
    run(): number;
    //run(forever?: boolean): Readonly<S & I>;
    stop(signal: number): number;
}
