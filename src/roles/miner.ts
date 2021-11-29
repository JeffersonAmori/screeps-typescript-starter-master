import { Consts } from "consts";
import { runInThisContext } from "vm";
import "libs/Traveler/Traveler";

export class RoleMiner {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if (creep.memory.targetContainerId && creep.memory.targetEnergySourceId) {
            let targetContainer = Game.getObjectById<StructureContainer>(creep.memory.targetContainerId)
            let targetSource = Game.getObjectById<Source>(creep.memory.targetEnergySourceId)

            if (!targetContainer || !targetSource)
                return;

            if (creep.pos.x == targetContainer.pos.x && creep.pos.y == targetContainer.pos.y) {
                creep.harvest(targetSource);
            } else {
                creep.travelTo(targetContainer);
            }
        } else {
            let otherMiner = _.find(creep.room.find(FIND_MY_CREEPS), c => c.memory.role == Consts.roleMiner && c.id != creep.id);
            if (!otherMiner) {
                const sources: Source[] | null = creep.room.find(FIND_SOURCES);
                const minerals: Mineral[] = creep.room.find(FIND_MINERALS);
                const sourcesWithContainer = _.filter(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);
                const mineralsWithContainer = _.filter(minerals, mineral => PathFinder.search(mineral.pos, mineral.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);

                if (sourcesWithContainer.length > 0) {
                    creep.memory.targetEnergySourceId = sourcesWithContainer[0].id;
                } else if (mineralsWithContainer.length > 0) {
                    creep.memory.targetEnergySourceId = mineralsWithContainer[0].id;
                }
            } else {
                const sources: Source[] | null = creep.room.find(FIND_SOURCES, { filter: s => s.id !== otherMiner?.memory.targetEnergySourceId });
                const minerals: Mineral[] = creep.room.find(FIND_MINERALS, { filter: m => m.id !== otherMiner?.memory.targetEnergySourceId });
                const sourcesWithContainer = _.find(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);
                const mineralWithContainer = _.find(minerals, mineral => PathFinder.search(mineral.pos, mineral.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);

                if (sourcesWithContainer) {
                    creep.memory.targetEnergySourceId = sourcesWithContainer.id;
                } else if (mineralWithContainer) {
                    creep.memory.targetEnergySourceId = mineralWithContainer.id;
                }
            }
            if (!creep.memory.targetEnergySourceId)
                return;
            let targetSource = Game.getObjectById<Source>(creep.memory.targetEnergySourceId);

            if (!targetSource)
                return;

            let targetContainer = targetSource.pos.findClosestByRange(FIND_STRUCTURES, {
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
