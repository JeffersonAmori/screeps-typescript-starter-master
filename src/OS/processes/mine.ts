import { RoleMiner } from "roles/miner";
import { Process } from "../kernel/process";
import { ProcessStatus } from "../kernel/process-status";

export class MineProcess extends Process<CreepProcessState> {
    public classPath(): string {
        return "MineProcess";
    }

    // public run(): number {
    //     if (!this.memory.creepId) {
    //         this.status = ProcessStatus.DEAD;
    //         return -1;
    //     }

    //     const creep: Creep | null = Game.getObjectById<Creep>(this.memory.creepId);


    //     if (!creep) {
    //         this.status = ProcessStatus.DEAD;
    //         return -1;
    //     }

    //     console.log(`Running miners via process! | ${this.pid} | ${creep.name}`)

    //     new RoleMiner(creep).run();
    //     return 0;
    // }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
    }
}
