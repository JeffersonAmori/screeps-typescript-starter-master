import { Consts } from "consts";
import { profile } from "libs/Profiler-ts/Profiler";
import { Process } from "../../../kernel/process";
import { getEnergyProcess } from "../common/getEnergy";

@profile
export class UpgraderProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "UpgraderProcess";
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

        if (this._creep.memory.working && this._creep.store.getUsedCapacity() === 0) {
            this._creep.memory.working = false;
            this._creep.say('harvesting');
            if (this._creep.memory.role !== Consts.roleUpgrader)
                this.kernel.killProcess(this.pid);
        }

        if (!this._creep.memory.working && this._creep.store.getUsedCapacity() === this._creep.store.getCapacity()) {
            this._creep.memory.working = true;
            this._creep.say('upgrading');
            if (this._creep.memory.role !== Consts.roleUpgrader)
                this.kernel.killProcess(this.pid);
        }

        if (this._creep.memory.working) {
            this.upgrade();
        }
        else {
            this.getEnergy();
        }

        return 0;
    }

    upgrade() {
        if (!this._creep)
            return;

        const controller = this._creep.room.controller;
        if (!controller)
            return;

        if (this._creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            this._creep.travelTo(controller);
        }

        return;
    }

    getEnergy() {
        if (!this._creep)
            return;

        let p = this.kernel.forkProcess(this, new getEnergyProcess(0, this.pid));
        p.setup(this.memory.creepId);

        return;
    }
}
