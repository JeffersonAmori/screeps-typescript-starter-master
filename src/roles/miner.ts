import { Consts } from "consts";
import { runInThisContext } from "vm";

export class RoleMiner {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if (creep.memory.targetContainerId && creep.memory.targetSourceId) {
            let targetContainer = Game.getObjectById<StructureContainer>(creep.memory.targetContainerId)
            let targetSource = Game.getObjectById<Source>(creep.memory.targetSourceId)

            if (!targetContainer || !targetSource)
                return;

            if (creep.pos.x == targetContainer.pos.x && creep.pos.y == targetContainer.pos.y) {
            } else {
                creep.moveTo(targetContainer);
            }
        } else {
            let otherMiner = _.find(creep.room.find(FIND_MY_CREEPS), c => c.memory.role == Consts.roleMiner && c.id != creep.id);
            if (!otherMiner) {
                let targetSource: Source | null = creep.pos.findClosestByPath(FIND_SOURCES);

                if (!targetSource)
                    return;

                creep.memory.targetSourceId = targetSource.id;
            } else {
                let occupiedSource = otherMiner.pos.findClosestByPath(FIND_SOURCES);
                let targetSource: Source | undefined = _.find(creep.room.find(FIND_SOURCES), s => s.id != occupiedSource?.id);

                if (!targetSource)
                    return;

                creep.memory.targetSourceId = targetSource.id;
            }

            let targetContainer = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER);
                }
            });

            if (!targetContainer)
                return;

            creep.memory.targetContainerId = targetContainer.id;
        }
    }
};
