import { Consts } from "consts";

export class RoleMiner {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        // var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        // if (!source)
        //     return;

        // if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        //     const creepContainer = Game.getObjectById<Structure>(creep.memory.myContainerId);
        //     if (!creepContainer)
        //         return;

        //     creep.moveTo(creepContainer);
        // }
        if (creep.memory.targetContainerId && creep.memory.targetSourceId) {
            let targetContainer = Game.getObjectById<StructureContainer>(creep.memory.targetContainerId)
            let targetSource = Game.getObjectById<Source>(creep.memory.targetSourceId)

            if (!targetContainer || !targetSource)
                return;

            if (creep.pos.x == targetContainer.pos.x && creep.pos.y == targetContainer.pos.y) {
                creep.harvest(targetSource);
            } else {
                creep.moveTo(targetContainer);
            }
        } else {

            let otherMiner = _.find(creep.room.find(FIND_MY_CREEPS), c => c.memory.role == Consts.roleMiner && c.id != creep.id);
            if (!otherMiner) {
                let source: Source | null = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (!source)
                    return;

                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            } else {
                let occupiedSource = otherMiner.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                let targetSource: Source | undefined = _.find(creep.room.find(FIND_SOURCES_ACTIVE), s => s.id != occupiedSource?.id);

                if (!targetSource)
                    return;

                let possibleContainers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER);
                    }
                });

                let targetContainer: StructureContainer = (<StructureContainer[]>_.sortBy(possibleContainers, c => c.pos.getRangeTo(targetSource!)))[0];
                creep.memory.targetContainerId = targetContainer.id;
                creep.memory.targetSourceId = targetSource.id;
            }
        }
    }
};
