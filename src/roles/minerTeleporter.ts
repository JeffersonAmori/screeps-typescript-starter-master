import { GlobalMemory } from "GlobalMemory";
import { ResourceDistanceMap } from "models/ResourceDistanceMap";

export class RoleMinerTeleporter {
    public static run(creep: Creep) {
        if (creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = false;
            creep.say('linking');
        }

        if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = true;
            creep.say('harvesting');
        }

        if (!creep.memory.targetEnergySourceId) {
            const baseStructureLinkId: string | null | undefined = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
            if (!baseStructureLinkId)
                return;

            let links: StructureLink[] = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK && s.id !== baseStructureLinkId });
            let sources: Source[] = creep.room.find(FIND_SOURCES);

            let distancesMap: ResourceDistanceMap[] = [];
            let sortedDistancesMap: ResourceDistanceMap[] = [];
            links.forEach(link => sources.forEach(source => distancesMap.push(new ResourceDistanceMap(source.id, PathFinder.search(link.pos, source.pos).path.length))));

            if (distancesMap.length > 0) {
                _.forEach(Game.creeps, creep => {
                    const entry = _.find(distancesMap, dist => {
                        if (!dist)
                            return false;

                        return dist.id === creep.memory.targetEnergySourceId;
                    });

                    if (entry)
                        distancesMap.splice(distancesMap.indexOf(entry), 1);
                });

                console.log(JSON.stringify(distancesMap));
                sortedDistancesMap = _.sortBy(distancesMap, x => x.cost);
                _.filter(sortedDistancesMap, x => x.id)

                let targetSourceId = sortedDistancesMap[0].id;
                creep.memory.targetEnergySourceId = targetSourceId;
            }
        }

        if (creep.memory.targetStructureLinkId) {
            const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
            if (!inMemoryBaseStructureLinkId)
                return;

            const targetStructureLinkId: string | undefined = creep.memory.targetStructureLinkId;
            const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

            if (!targetStructureLinkId || !baseStructureLinkId)
                return;

            const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
            const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

            if (!structureTargetStructureLink || !structureBaseStructureLink)
                return;

            if (structureTargetStructureLink.store.getUsedCapacity(RESOURCE_ENERGY)! > 0) {
                structureTargetStructureLink.transferEnergy(structureBaseStructureLink);
                return;
            }
        }

        if (creep.memory.working && creep.memory.targetEnergySourceId) {
            let source: Source | Mineral | null = Game.getObjectById(creep.memory.targetEnergySourceId);

            if (!source)
                return;

            const ret = creep.harvest(source);
            if (ret === ERR_NOT_IN_RANGE) {
                creep.moveTo(source)
            }

            if (ret === OK && !creep.memory.targetStructureLinkId) {
                const closestStructureLink: StructureLink | null = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK });
                if (!closestStructureLink)
                    return;

                creep.memory.targetStructureLinkId = closestStructureLink.id;
            }

            if (creep.store.getFreeCapacity() === 0)
                creep.memory.working = false;
        } else {
            const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
            if (!inMemoryBaseStructureLinkId)
                return;

            const targetStructureLinkId: string | undefined = creep.memory.targetStructureLinkId;
            const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

            if (!targetStructureLinkId || !baseStructureLinkId)
                return;

            const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
            const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

            if (!structureTargetStructureLink || !structureBaseStructureLink)
                return;

            if (creep.transfer(structureTargetStructureLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(structureTargetStructureLink);
            }
        }
    }
}
