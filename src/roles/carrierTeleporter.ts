import { RoleCommon } from "./_common";
import { Traveler } from "../libs/Traveler/Traveler";
import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";

export class RoleCarrierTeleporter {
    public static run(creep: Creep): void {
        /** @param {Creep} creep **/

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = false;
            creep.say('getting');
        }

        if (!creep.memory.working && creep.store.getUsedCapacity() === creep.store.getCapacity()) {
            creep.memory.working = true;
            creep.say('delivering');
        }

        if (!creep.memory.targetEnergySourceId) {
            const baseStructureLinkId: string | null | undefined = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
            if (!baseStructureLinkId)
                return;

            const structureBaseStructureLinkId: StructureLink | null = Game.getObjectById(baseStructureLinkId);

            if (!structureBaseStructureLinkId)
                return;

            creep.memory.targetEnergySourceId = baseStructureLinkId;
        }

        if (creep.memory.working) {
            if (!creep.memory.targetEnergySourceId)
                return;

            const structureTargetEnergySource: StructureLink | null = Game.getObjectById(creep.memory.targetEnergySourceId);

            if (!structureTargetEnergySource)
                return;

            if (creep.withdraw(structureTargetEnergySource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(structureTargetEnergySource);
            }
        } else {
            const storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_STORAGE });

            if (!storage)
                return;

            if(creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(storage);
            }
        }
    }
};
