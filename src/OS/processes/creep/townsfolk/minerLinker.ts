import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";
import { ResourceDistanceMap } from "models/ResourceDistanceMap";
import { Process } from 'OS/kernel/process';
import { profile } from "libs/Profiler-ts/Profiler";
import "libs/Traveler/Traveler";
import * as _ from 'lodash';

@profile
export class MinerLinkerProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "MinerLinkerProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        return this;
    }

    public run(): number {
        this._creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (!this._creep) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        if (this._creep.memory.working && this._creep.store.getFreeCapacity() === 0) {
            this._creep.memory.working = false;
            this._creep.say('linking');
        }

        if (!this._creep.memory.working && this._creep.store.getUsedCapacity() === 0) {
            this._creep.memory.working = true;
            this._creep.say('harvesting');
        }

        if (!this._creep.memory.targetEnergySourceId)
            this.getTargetEnergySourceId();

        if (this._creep.memory.targetEnergySourceId && this._creep.memory.working)
            this.harvest();

        if (this._creep.memory.targetEnergySourceId && !this._creep.memory.working) {
            if (!this._creep.memory.linkReadyForActivation) {
                this.tranferEnergyToClosestLink();
            } else {
                this.activateLink();
            }
        }

        return 0;
    }

    getTargetEnergySourceId() {
        if (!this._creep)
            return;

        const baseStructureLinkId: string | null | undefined = GlobalMemory.RoomInfo[this._creep.room.name].storageLinkId;
        if (!baseStructureLinkId)
            return;

        let links: StructureLink[] = this._creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK && s.id !== baseStructureLinkId });
        let sources: Source[] = this._creep.room.find(FIND_SOURCES);

        let distancesMap: ResourceDistanceMap[] = [];
        let sortedDistancesMap: ResourceDistanceMap[] = [];
        links.forEach(link => sources.forEach(source => distancesMap.push(new ResourceDistanceMap(source.id, PathFinder.search(link.pos, source.pos).path.length))));

        if (distancesMap.length > 0) {
            _.forEach(this._creep.room.find(FIND_MY_CREEPS), creep => {
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
            this._creep.memory.targetEnergySourceId = targetSourceId;
        }
    }

    harvest() {
        if (!this._creep)
            return;

        if (!this._creep.memory.targetEnergySourceId)
            return;

        let source: Source | Mineral | null = Game.getObjectById(this._creep.memory.targetEnergySourceId);

        if (!source)
            return;

        const ret = this._creep.harvest(source);
        if (ret === ERR_NOT_IN_RANGE) {
            this._creep.travelTo(source)
        }

        if (ret === OK && !this._creep.memory.targetStructureLinkId) {
            const closestStructureLink: StructureLink | null = this._creep.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK });
            if (!closestStructureLink)
                return;

            this._creep.memory.targetStructureLinkId = closestStructureLink.id;
        }

        return;
    }

    tranferEnergyToClosestLink() {
        if (!this._creep)
            return;

        const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[this._creep.room.name].storageLinkId;
        if (!inMemoryBaseStructureLinkId)
            return;

        const targetStructureLinkId: string | undefined = this._creep.memory.targetStructureLinkId;
        const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

        if (!targetStructureLinkId || !baseStructureLinkId)
            return;

        const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
        const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

        if (!structureTargetStructureLink || !structureBaseStructureLink) {
            return;
        }

        if (this._creep.transfer(structureTargetStructureLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            this._creep.travelTo(structureTargetStructureLink);
        }

        this._creep.memory.linkReadyForActivation = true;

        return;
    }

    activateLink() {
        if (!this._creep)
            return;

        const inMemoryBaseStructureLinkId = GlobalMemory.RoomInfo[this._creep.room.name].storageLinkId;
        if (!inMemoryBaseStructureLinkId)
            return;


        const targetStructureLinkId: string | undefined = this._creep.memory.targetStructureLinkId;
        const baseStructureLinkId: string | null = inMemoryBaseStructureLinkId;

        if (!targetStructureLinkId || !baseStructureLinkId)
            return;

        const structureTargetStructureLink: StructureLink | null = Game.getObjectById(targetStructureLinkId);
        const structureBaseStructureLink: StructureLink | null = Game.getObjectById(baseStructureLinkId);

        if (!structureTargetStructureLink || !structureBaseStructureLink)
            return;

        if (structureTargetStructureLink.store.getUsedCapacity(RESOURCE_ENERGY)! > 0)
            structureTargetStructureLink.transferEnergy(structureBaseStructureLink);

        this._creep.memory.linkReadyForActivation = false;

        return;
    }
}
