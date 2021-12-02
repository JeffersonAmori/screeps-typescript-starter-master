import { Consts } from "consts";
import { Process } from "OS/kernel/process";
import { ProcessStatus } from "OS/kernel/process-status";
import { RoleMiner } from "roles/miner";
import { when } from "when-ts";

export class MineProcess extends Process<CreepState> {
    public classPath(): string {
        return "MineProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        this.setInitialState({ creep: Game.getObjectById<Creep>(this.memory.creepId)! })
    }

    @when<CreepState>(c => !c.creep)
    noMoreCreep(s: CreepState, m: MineProcess){
        this.status = ProcessStatus.DEAD;

        m.exit();
    }

    @when(s => s.creep.memory.targetContainerId && s.creep.memory.targetEnergySourceId)
    harvest(s: CreepState, m: RoleMiner) {
        if (!s.creep.memory.targetContainerId || !s.creep.memory.targetEnergySourceId)
            return;

        let targetContainer = Game.getObjectById<StructureContainer>(s.creep.memory.targetContainerId)
        let targetSource = Game.getObjectById<Source>(s.creep.memory.targetEnergySourceId)

        if (!targetContainer || !targetSource)
            return;

        if (s.creep.pos.x == targetContainer.pos.x && s.creep.pos.y == targetContainer.pos.y) {
            s.creep.harvest(targetSource);
        } else {
            s.creep.travelTo(targetContainer);
        }

        m.exit();
    }

    @when(s => !s.creep.memory.targetContainerId || !s.creep.memory.targetEnergySourceId)
    findTargetEnergySourceAndContainer(s: CreepState, m: RoleMiner) {
        let otherMiner = _.find(s.creep.room.find(FIND_MY_CREEPS), c => c.memory.role == Consts.roleMiner && c.id != s.creep.id);
        if (!otherMiner) {
            const sources: Source[] | null = s.creep.room.find(FIND_SOURCES);
            const minerals: Mineral[] = s.creep.room.find(FIND_MINERALS);
            const sourcesWithContainer = _.filter(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);
            const mineralsWithContainer = _.filter(minerals, mineral => PathFinder.search(mineral.pos, mineral.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);

            if (sourcesWithContainer.length > 0) {
                s.creep.memory.targetEnergySourceId = sourcesWithContainer[0].id;
            } else if (mineralsWithContainer.length > 0) {
                s.creep.memory.targetEnergySourceId = mineralsWithContainer[0].id;
            }
        } else {
            const sources: Source[] | null = s.creep.room.find(FIND_SOURCES, { filter: s => s.id !== otherMiner?.memory.targetEnergySourceId });
            const minerals: Mineral[] = s.creep.room.find(FIND_MINERALS, { filter: m => m.id !== otherMiner?.memory.targetEnergySourceId });
            const sourcesWithContainer = _.find(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);
            const mineralWithContainer = _.find(minerals, mineral => PathFinder.search(mineral.pos, mineral.pos.findClosestByPath(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_CONTAINER, ignoreCreeps: true })!.pos).path.length < 3);

            if (sourcesWithContainer) {
                s.creep.memory.targetEnergySourceId = sourcesWithContainer.id;
            } else if (mineralWithContainer) {
                s.creep.memory.targetEnergySourceId = mineralWithContainer.id;
            }
        }

        if (!s.creep.memory.targetEnergySourceId) {
            m.exit()
            return;
        }

        let targetSource = Game.getObjectById<Source>(s.creep.memory.targetEnergySourceId);

        if (!targetSource) {
            m.exit()
            return;
        }

        let targetContainer = targetSource.pos.findClosestByRange(FIND_STRUCTURES, { filter: (structure: Structure) => { return (structure.structureType == STRUCTURE_CONTAINER); } });

        if (!targetContainer) {
            m.exit()
            return;
        }

        s.creep.memory.targetContainerId = targetContainer.id;
    }
}
