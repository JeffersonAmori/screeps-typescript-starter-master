import { Consts } from "consts";
import { Process } from "OS/kernel/process";

export class garbageCollectionProcess extends Process {
    public setup(..._: any[]): Process {
        return this;
    }

    public classPath(){
        return 'garbageCollectionProcess';
    }

    public run(): number {

        this.kernel.garbageCollection();

        for (const name in Memory.creeps) {
            if (!(name in Game.creeps)) {
                delete Memory.creeps[name];
            }
        }

        //this.kernel.killProcess(this.pid);

        this.kernel.sleepProcessByTime(this, Consts.garbageCollectionInterval);
        return 0;
    }

}
