import { RoleCommon } from "./_common";
import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";
import { RoleCarrier } from "./carrier";

export class RoleCarrierTeleporter {
    public static run(creep: Creep): void {
        /** @param {Creep} creep **/

        if (creep.memory.working && creep.store.getUsedCapacity() > 0) {
            creep.memory.working = false;
            creep.say('delivering');
        }

        if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = true;
            creep.say('getting');
        }

        if (!creep.memory.targetEnergySourceId) {
            const baseStructureLinkId: string | null | undefined = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
            if (!baseStructureLinkId)
                return;

            const structureBaseStructureLinkId: StructureLink | null = Game.getObjectById(baseStructureLinkId);

            if (!structureBaseStructureLinkId)
                return;

            creep.memory.targetEnergySourceId = structureBaseStructureLinkId.id;
        }

        if (creep.memory.working) {
            if (!creep.memory.targetEnergySourceId)
                return;

            const structureTargetEnergySource: StructureLink | null = Game.getObjectById(creep.memory.targetEnergySourceId);

            if (!structureTargetEnergySource)
                return;

            const ret = creep.withdraw(structureTargetEnergySource, RESOURCE_ENERGY);
            if (ret === ERR_NOT_IN_RANGE) {
                creep.moveTo(structureTargetEnergySource);
            } else if (ret === ERR_NOT_ENOUGH_ENERGY) {
                if(creep.withdraw(structureTargetEnergySource, RESOURCE_UTRIUM) === OK){
                    creep.memory.otherResources?.push(RESOURCE_UTRIUM);
                }
            }
        } else {
            RoleCarrier.run(creep);
        }
    }
};
