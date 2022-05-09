import { profile } from "libs/Profiler-ts";
import { Process } from "../../../kernel/process";
import { HarvesterProcess } from "../townsfolk/harvester";

@profile
export class PillagerProcess extends Process {
    private _creep: Creep | null = null;
    public classPath(): string {
        return "PillagerProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        return this;
    }

    public run(): number {
        this._creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (!this._creep) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        if (this._creep.memory.working && this._creep.store.getFreeCapacity() === 0) {
            this._creep.memory.working = false;
            this._creep.say('delivering');
        }

        if (!this._creep.memory.working && this._creep.store.getUsedCapacity() === 0) {
            this._creep.memory.working = true;
            this._creep.say('pillaging');
        }

        if (this._creep.memory.working)
            this.pillaging();
        else
            this.delivering();

        return 0;
    }

    pillaging() {
      if (!this._creep || !Game.flags.pillageFlag)
            return;

        if (this._creep.room !== Game.flags.pillageFlag.room) {
            this._creep.travelTo(Game.flags.pillageFlag);
        }
        else {
            this.kernel.forkProcess(this, new HarvesterProcess(0, this.pid))
                .setup(this.memory.creepId);
        }

        return;
    }

    delivering() {
      if (!this._creep || !Game.flags.pillageFlag)
            return;

        if (this._creep.room === Game.flags.pillageFlag.room) {
            if (Game.flags.depositFlag) {
                this._creep.travelTo(Game.flags.depositFlag);
            }
        }
        else {
            this.kernel.forkProcess(this, new HarvesterProcess(0, this.pid))
                .setup(this.memory.creepId);
        }

        return { creep: this._creep };
    }
}
