import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";
import { profile } from "libs/Profiler-ts/Profiler";
import { CarrierProcess } from "./carrier";
import "libs/Traveler/Traveler";

@profile
export class CarrierLinkerProcess extends Process {

    private _creep: Creep | null = null;

    public classPath(): string {
        return "CarrierProcess";
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

        if (this._creep.memory.working && this._creep.store.getUsedCapacity() > 0) {
            this._creep.memory.working = false;
            this._creep.say('delivering');
        }

        if (!this._creep.memory.working && this._creep.store.getUsedCapacity() === 0) {
            this._creep.memory.working = true;
            this._creep.say('getting');
        }
        0
        if (!this._creep.memory.targetEnergySourceId) {
            const baseStructureLinkId: string | null | undefined = GlobalMemory.RoomInfo[this._creep.room.name].storageLinkId;
            if (!baseStructureLinkId)
                return -1;

            const structureBaseStructureLinkId: StructureLink | null = Game.getObjectById(baseStructureLinkId);

            if (!structureBaseStructureLinkId)
                return -1;

            this._creep.memory.targetEnergySourceId = structureBaseStructureLinkId.id;
        }

        if (this._creep.memory.working) {
            if (!this._creep.memory.targetEnergySourceId)
                return -1;

            const structureTargetEnergySource: StructureLink | null = Game.getObjectById(this._creep.memory.targetEnergySourceId);

            if (!structureTargetEnergySource)
                return -1;

            const ret = this._creep.withdraw(structureTargetEnergySource, RESOURCE_ENERGY);
            if (ret === ERR_NOT_IN_RANGE) {
                this._creep.travelTo(structureTargetEnergySource);
            } else if (ret === ERR_NOT_ENOUGH_ENERGY) {
                if (this._creep.withdraw(structureTargetEnergySource, RESOURCE_UTRIUM) === OK) {
                    this._creep.memory.otherResources?.push(RESOURCE_UTRIUM);
                }
            }
        } else {
            this.kernel.forkProcess(this, new CarrierProcess(0, this.pid))
                .setup(this.memory.creepId);
        }

        return 0;
    }
}
