import { RoleHarvester } from "roles/harvester";
import { Process } from "../../../kernel/process";


export class PillagerProcess extends Process {
    private _creep: Creep | null = null;
    public classPath(): string {
        return "PillagerProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
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
        if (!this._creep)
            return;

        if (this._creep.room !== Game.flags.pillageFlag.room) {
            this._creep.travelTo(Game.flags.pillageFlag);
        }
        else {
            RoleHarvester.run(this._creep);
        }

        return;
    }

    delivering() {
        if (!this._creep)
            return;

        if (this._creep.room === Game.flags.pillageFlag.room) {
            if (Game.flags.depositFlag) {
                this._creep.travelTo(Game.flags.depositFlag);
            }
        }
        else {
            RoleHarvester.run(this._creep);
        }

        return { creep: this._creep };
    }
}
