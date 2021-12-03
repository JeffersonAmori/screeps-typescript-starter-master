import { StateMachine, when } from 'when-ts';
import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";
import { ResourceDistanceMap } from "models/ResourceDistanceMap";
import "libs/Traveler/Traveler";
import { Process } from 'OS/kernel/process';

interface MinerLinkerCreepState extends CreepState {
    linkReadyForActivation: boolean;
}

export class MinerLinkerProcess extends Process<MinerLinkerCreepState> {

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        this.setInitialState({ creep: Game.getObjectById<Creep>(this.memory.creepId)!, linkReadyForActivation: false })
    }

    @when<CreepState>(c => !c.creep)
    noCreepDefined(s: CreepState, m: MinerLinkerProcess) {
        const creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (creep) {
            s.creep = creep;
            return s;
        } else {
            this.kernel.killProcess(this.pid);
            m.exit();
        }

        return;
    }

    @when<MinerLinkerCreepState>(s => s.creep.memory.working && s.creep.store.getFreeCapacity() === 0)
    finishedWorking(s: MinerLinkerCreepState, m: MinerLinkerProcess) {
        s.creep.memory.working = false;
        s.creep.say('linking');
    }

    @when<MinerLinkerCreepState>(s => !s.creep.memory.working && s.creep.store.getUsedCapacity() === 0)
    startedWorking(s: MinerLinkerCreepState, m: MinerLinkerProcess) {
        s.creep.memory.working = true;
        s.creep.say('harvesting');
    }

    @when<MinerLinkerCreepState>(s => !s.creep.memory.targetEnergySourceId)
    getTargetEnergySourceId(s: MinerLinkerCreepState, m: MinerLinkerProcess) {
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

    @when<MinerLinkerCreepState>(s => s.creep.memory.targetEnergySourceId && s.creep.memory.working)
    harvest(s: MinerLinkerCreepState, m: MinerLinkerProcess) {
        if (!s.creep.memory.targetEnergySourceId){
            m.exit();
            return;
        }

        let source: Source | Mineral | null = Game.getObjectById(s.creep.memory.targetEnergySourceId);

        if (!source){
            m.exit();
            return;
        }

        const ret = s.creep.harvest(source);
        if (ret === ERR_NOT_IN_RANGE) {
            s.creep.travelTo(source)
        }

        if (ret === OK && !s.creep.memory.targetStructureLinkId) {
            const closestStructureLink: StructureLink | null = s.creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK });
            if (!closestStructureLink){
                m.exit();
                return;
            }

            s.creep.memory.targetStructureLinkId = closestStructureLink.id;
        }

        m.exit();
    }

    @when<MinerLinkerCreepState>(s => s.creep.memory.targetEnergySourceId && !s.creep.memory.working && !s.linkReadyForActivation)
    tranferEnergyToClosestLink(s: MinerLinkerCreepState, m: MinerLinkerProcess) {
        const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[s.creep.room.name].storageLinkId;
        if (!inMemoryBaseStructureLinkId) {
            m.exit();
            return;
        }

        const targetStructureLinkId: string | undefined = s.creep.memory.targetStructureLinkId;
        const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

        if (!targetStructureLinkId || !baseStructureLinkId) {
            m.exit();
            return;
        }

        const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
        const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

        if (!structureTargetStructureLink || !structureBaseStructureLink) {
            m.exit();
            return;
        }

        if (s.creep.transfer(structureTargetStructureLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            s.creep.travelTo(structureTargetStructureLink);
        }

        s.linkReadyForActivation = true;
        return s;
    }

    @when<MinerLinkerCreepState>(s => s.creep.memory.targetEnergySourceId && !s.creep.memory.working && s.linkReadyForActivation)
    activateLink(s: MinerLinkerCreepState, m: MinerLinkerProcess) {
        const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[s.creep.room.name].storageLinkId;
        if (!inMemoryBaseStructureLinkId) {
            m.exit();
            return;
        }

        const targetStructureLinkId: string | undefined = s.creep.memory.targetStructureLinkId;
        const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

        if (!targetStructureLinkId || !baseStructureLinkId) {
            m.exit();
            return;
        }

        const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
        const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

        if (!structureTargetStructureLink || !structureBaseStructureLink) {
            m.exit();
            return;
        }

        if (structureTargetStructureLink.store.getUsedCapacity(RESOURCE_ENERGY)! > 0) {
            structureTargetStructureLink.transferEnergy(structureBaseStructureLink);

            m.exit();
            return;
        }
    }
}
