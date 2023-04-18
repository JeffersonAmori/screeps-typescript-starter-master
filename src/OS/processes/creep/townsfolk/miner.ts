import { Consts } from "consts";
import { profile } from "libs/Profiler-ts/Profiler";
import { Process } from "OS/kernel/process";
import * as _ from 'lodash';

@profile
export class MinerProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "MinerProcess";
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

        if (this._creep.memory.targetContainerId && this._creep.memory.targetEnergySourceId) {
            this.harvest()
        }
        else {
            this.findTargetEnergySourceAndContainer();
        }

        return 0;
    }

    harvest() {
        if (!this._creep)
            return;

        if (!this._creep.memory.targetContainerId || !this._creep.memory.targetEnergySourceId)
            return;


        let targetContainer = Game.getObjectById<StructureContainer>(this._creep.memory.targetContainerId)
        let targetSource = Game.getObjectById<Source>(this._creep.memory.targetEnergySourceId)

        if (!targetContainer || !targetSource)
            return;

        if (this._creep.pos.x == targetContainer.pos.x && this._creep.pos.y == targetContainer.pos.y) {
            this._creep.harvest(targetSource);
        } else {
            this._creep.travelTo(targetContainer);
        }

        return;
    }

    findTargetEnergySourceAndContainer() {
        if (!this._creep)
            return;

        let otherMiner = _.find(this._creep.room.find(FIND_MY_CREEPS), c => this._creep && c.memory.role == Consts.roleMiner && c.id != this._creep.id) as Creep;
        if (!otherMiner) {
            const sources: Source[] | null = this._creep.room.find(FIND_SOURCES);
            const minerals: Mineral[] = this._creep.room.find(FIND_MINERALS);
            const sourcesWithContainer = _.filter(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);
            const mineralsWithContainer = _.filter(minerals, mineral => PathFinder.search(mineral.pos, mineral.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);

            if (sourcesWithContainer.length > 0) {
                this._creep.memory.targetEnergySourceId = sourcesWithContainer[0].id;
            } else if (mineralsWithContainer.length > 0) {
                this._creep.memory.targetEnergySourceId = mineralsWithContainer[0].id;
            }
        } else {
            const sources: Source[] | null = this._creep.room.find(FIND_SOURCES, { filter: s => s.id !== otherMiner?.memory.targetEnergySourceId });
            const minerals: Mineral[] = this._creep.room.find(FIND_MINERALS, { filter: m => m.id !== otherMiner?.memory.targetEnergySourceId });
            const sourcesWithContainer = _.find(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);
            const mineralWithContainer = _.find(minerals, mineral => PathFinder.search(mineral.pos, mineral.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);

            if (sourcesWithContainer) {
                this._creep.memory.targetEnergySourceId = sourcesWithContainer.id;
            } else if (mineralWithContainer) {
                this._creep.memory.targetEnergySourceId = mineralWithContainer.id;
            }
        }

        if (!this._creep.memory.targetEnergySourceId)
            return;

        let targetSource = Game.getObjectById<Source>(this._creep.memory.targetEnergySourceId);

        if (!targetSource)
            return;

        let targetContainer = targetSource.pos.findClosestByRange(FIND_STRUCTURES, { filter: (structure: Structure) => { return (structure.structureType == STRUCTURE_CONTAINER); } });

        if (!targetContainer)
            return;

        this._creep.memory.targetContainerId = targetContainer.id;
    }
}
