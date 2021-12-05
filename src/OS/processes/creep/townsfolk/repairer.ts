import { Process } from "OS/kernel/process";
import { RoleBuilder } from "roles/builder";
import { RoleCommon } from "roles/_common";
import { when } from "when-ts";

export class RepairerProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "RepairerProcess";
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

        if (this._creep.memory.working && this._creep.store.getUsedCapacity() === 0) {
            this._creep.memory.working = false;
            this._creep.say('harvesting');
        }

        if (!this._creep.memory.working && this._creep.store.getUsedCapacity() === this._creep.store.getCapacity()) {
            this._creep.memory.working = true;
            this._creep.say('repairing');
        }

        if (this._creep.memory.working) {
            if (!this._creep.memory.structureToRepairId)
                this.findConstructionSite();

            if (this._creep.memory.structureToRepairId)
                this.repair();
        }
        else {
            this.getEnergy();
        }

        return 0;
    }

    findConstructionSite() {
        if (!this._creep)
            return;

        let structures = this._creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL)
        });

        if (!structures) {
            RoleBuilder.run(this._creep);
            return;
        }

        let targetStructure = _.sortBy(structures, s => s.hits / s.hitsMax)[0];
        this._creep.memory.structureToRepairId = targetStructure.id;

        return;
    }

    repair() {
        if (!this._creep || !this._creep.memory.structureToRepairId)
            return;

        const structureToRepair: Structure | null = Game.getObjectById<Structure>(this._creep.memory.structureToRepairId);

        if (!structureToRepair)
            return;

        if (structureToRepair.hits === structureToRepair.hitsMax) {
            delete this._creep.memory.structureToRepairId;
            return;
        }

        if (this._creep.repair(structureToRepair) === ERR_NOT_IN_RANGE) {
            this._creep.travelTo(structureToRepair);
        }

        return;
    }

    getEnergy() {
        if (!this._creep)
            return;

        delete this._creep.memory.structureToRepairId;
        RoleCommon.getEnergy(this._creep);

        return;
    }
};
