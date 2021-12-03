import { StateMachine, when } from 'when-ts';
import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";
import { ResourceDistanceMap } from "models/ResourceDistanceMap";
import "libs/Traveler/Traveler";

interface RoleMinerTeleporterCreepState extends CreepState {
    linkReadyToActivation: boolean;
}

export class RoleMinerTeleporter extends StateMachine<RoleMinerTeleporterCreepState> {

    constructor(creep: Creep) {
        super({ creep: creep, linkReadyToActivation: false });
    }

    @when<RoleMinerTeleporterCreepState>(s => s.creep.memory.working && s.creep.store.getFreeCapacity() === 0)
    finishedWorking(s: RoleMinerTeleporterCreepState, m: RoleMinerTeleporter) {
        s.creep.memory.working = false;
        s.creep.say('linking');
    }

    @when<RoleMinerTeleporterCreepState>(s => !s.creep.memory.working && s.creep.store.getUsedCapacity() === 0)
    startedWorking(s: RoleMinerTeleporterCreepState, m: RoleMinerTeleporter) {
        s.creep.memory.working = true;
        s.creep.say('harvesting');
    }

    @when<RoleMinerTeleporterCreepState>(s => !s.creep.memory.targetEnergySourceId)
    getTargetEnergySourceId(s: RoleMinerTeleporterCreepState, m: RoleMinerTeleporter) {
        const baseStructureLinkId: string | null | undefined = GlobalMemory.RoomInfo[s.creep.room.name].storageLinkId;
        if (!baseStructureLinkId)
            return;

        let links: StructureLink[] = s.creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK && s.id !== baseStructureLinkId });
        let sources: Source[] = s.creep.room.find(FIND_SOURCES);

        let distancesMap: ResourceDistanceMap[] = [];
        let sortedDistancesMap: ResourceDistanceMap[] = [];
        links.forEach(link => sources.forEach(source => distancesMap.push(new ResourceDistanceMap(source.id, PathFinder.search(link.pos, source.pos).path.length))));

        if (distancesMap.length > 0) {
            _.forEach(s.creep.room.find(FIND_MY_CREEPS), creep => {
                const entries = _.filter(distancesMap, dist => {
                    if (!dist)
                        return false;

                    return dist.id === creep.memory.targetEnergySourceId && (creep.memory.role === Consts.roleMiner || creep.memory.role === Consts.roleMinerLinker);
                });

                if (entries && entries.length > 0) {
                    entries.forEach(entry => distancesMap.splice(distancesMap.indexOf(entry), 1));
                }

            });

            sortedDistancesMap = _.sortBy(distancesMap, x => x.cost);
            _.filter(sortedDistancesMap, x => x.id)

            let targetSourceId = sortedDistancesMap[0].id;
            s.creep.memory.targetEnergySourceId = targetSourceId;
        }
    }

    @when<RoleMinerTeleporterCreepState>(s => s.creep.memory.targetEnergySourceId && s.creep.memory.working)
    harvest(s: RoleMinerTeleporterCreepState, m: RoleMinerTeleporter) {
        if (!s.creep.memory.targetEnergySourceId)
            return;

        let source: Source | Mineral | null = Game.getObjectById(s.creep.memory.targetEnergySourceId);

        if (!source)
            return;

        const ret = s.creep.harvest(source);
        if (ret === ERR_NOT_IN_RANGE) {
            s.creep.travelTo(source)
        }

        if (ret === OK && !s.creep.memory.targetStructureLinkId) {
            const closestStructureLink: StructureLink | null = s.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK });
            if (!closestStructureLink)
                return;

            s.creep.memory.targetStructureLinkId = closestStructureLink.id;
        }

        m.exit();
    }

    @when<RoleMinerTeleporterCreepState>(s => s.creep.memory.targetEnergySourceId && !s.creep.memory.working && !s.linkReadyToActivation)
    tranferEnergyToClosestLink(s: RoleMinerTeleporterCreepState, m: RoleMinerTeleporter) {
        const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[s.creep.room.name].storageLinkId;
        if (!inMemoryBaseStructureLinkId)
            return;

        const targetStructureLinkId: string | undefined = s.creep.memory.targetStructureLinkId;
        const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

        if (!targetStructureLinkId || !baseStructureLinkId)
            return;

        const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
        const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

        if (!structureTargetStructureLink || !structureBaseStructureLink)
            return;

        if (s.creep.transfer(structureTargetStructureLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            s.creep.travelTo(structureTargetStructureLink);
        }

        s.linkReadyToActivation = true;
        return s;
    }

    @when<RoleMinerTeleporterCreepState>(s => s.creep.memory.targetEnergySourceId && !s.creep.memory.working && s.linkReadyToActivation)
    activateLink(s: RoleMinerTeleporterCreepState, m: RoleMinerTeleporter) {
        const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[s.creep.room.name].storageLinkId;
        if (!inMemoryBaseStructureLinkId)
            return;

        const targetStructureLinkId: string | undefined = s.creep.memory.targetStructureLinkId;
        const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

        if (!targetStructureLinkId || !baseStructureLinkId)
            return;

        const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
        const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

        if (!structureTargetStructureLink || !structureBaseStructureLink)
            return;

        if (structureTargetStructureLink.store.getUsedCapacity(RESOURCE_ENERGY)! > 0) {
            structureTargetStructureLink.transferEnergy(structureBaseStructureLink);

            m.exit();
            return;
        }
    }

    // public static run(creep: Creep) {
    //     if (creep.memory.working && creep.store.getFreeCapacity() === 0) {
    //         creep.memory.working = false;
    //         creep.say('linking');
    //     }

    //     if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
    //         creep.memory.working = true;
    //         creep.say('harvesting');
    //     }

    //     if (!creep.memory.targetEnergySourceId) {
    //         const baseStructureLinkId: string | null | undefined = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
    //         if (!baseStructureLinkId)
    //             return;

    //         let links: StructureLink[] = creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK && s.id !== baseStructureLinkId });
    //         let sources: Source[] = creep.room.find(FIND_SOURCES);

    //         let distancesMap: ResourceDistanceMap[] = [];
    //         let sortedDistancesMap: ResourceDistanceMap[] = [];
    //         links.forEach(link => sources.forEach(source => distancesMap.push(new ResourceDistanceMap(source.id, PathFinder.search(link.pos, source.pos).path.length))));

    //         if (distancesMap.length > 0) {
    //             _.forEach(creep.room.find(FIND_MY_CREEPS), creep => {
    //                 const entries = _.filter(distancesMap, dist => {
    //                     if (!dist)
    //                         return false;

    //                     return dist.id === creep.memory.targetEnergySourceId && (creep.memory.role === Consts.roleMiner || creep.memory.role === Consts.roleMinerTeleporter);
    //                 });

    //                 if (entries && entries.length > 0) {
    //                     entries.forEach(entry => distancesMap.splice(distancesMap.indexOf(entry), 1));
    //                 }

    //             });

    //             sortedDistancesMap = _.sortBy(distancesMap, x => x.cost);
    //             _.filter(sortedDistancesMap, x => x.id)

    //             let targetSourceId = sortedDistancesMap[0].id;
    //             creep.memory.targetEnergySourceId = targetSourceId;
    //         }
    //     }

    //     if (creep.memory.targetStructureLinkId) {
    //         const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
    //         if (!inMemoryBaseStructureLinkId)
    //             return;

    //         const targetStructureLinkId: string | undefined = creep.memory.targetStructureLinkId;
    //         const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

    //         if (!targetStructureLinkId || !baseStructureLinkId)
    //             return;

    //         const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
    //         const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

    //         if (!structureTargetStructureLink || !structureBaseStructureLink)
    //             return;

    //         if (structureTargetStructureLink.store.getUsedCapacity(RESOURCE_ENERGY)! > 0) {
    //             structureTargetStructureLink.transferEnergy(structureBaseStructureLink);
    //             return;
    //         }
    //     }

    //     if (creep.memory.working && creep.memory.targetEnergySourceId) {
    //         let source: Source | Mineral | null = Game.getObjectById(creep.memory.targetEnergySourceId);

    //         if (!source)
    //             return;

    //         const ret = creep.harvest(source);
    //         if (ret === ERR_NOT_IN_RANGE) {
    //             creep.travelTo(source)
    //         }

    //         if (ret === OK && !creep.memory.targetStructureLinkId) {
    //             const closestStructureLink: StructureLink | null = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK });
    //             if (!closestStructureLink)
    //                 return;

    //             creep.memory.targetStructureLinkId = closestStructureLink.id;
    //         }

    //         if (creep.store.getFreeCapacity() === 0)
    //             creep.memory.working = false;
    //     } else {
    //         const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[creep.room.name].baseStructureLinkId;
    //         if (!inMemoryBaseStructureLinkId)
    //             return;

    //         const targetStructureLinkId: string | undefined = creep.memory.targetStructureLinkId;
    //         const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

    //         if (!targetStructureLinkId || !baseStructureLinkId)
    //             return;

    //         const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
    //         const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

    //         if (!structureTargetStructureLink || !structureBaseStructureLink)
    //             return;

    //         if (creep.transfer(structureTargetStructureLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
    //             creep.travelTo(structureTargetStructureLink);
    //         }
    //     }
    // }
}
