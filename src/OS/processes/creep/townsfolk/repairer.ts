import { Process } from "OS/kernel/process";
import { ProcessStatus } from "OS/kernel/process-status";
import { RoleBuilder } from "roles/builder";
import { RoleCommon } from "roles/_common";
import { when } from "when-ts";

interface RepairerProcessCreepStateCreep extends CreepState {
    nothingToUpgrade: boolean;
}

export class RepairerProcess extends Process<CreepState> {

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        this.setInitialState({ creep: Game.getObjectById<Creep>(this.memory.creepId)! })
    }

    @when<CreepState>(c => !c.creep)
    noCreepDefined(s: CreepState, m: RepairerProcess) {
        const creep = Game.getObjectById<Creep>(this.memory.creepId);
        if(creep){
            s.creep = creep;
            return s;
        }else{
            this.status = ProcessStatus.DEAD;
            m.exit();
        }

        return;
    }

    @when<RepairerProcessCreepStateCreep>(s => s.creep.memory.working && s.creep.store.getUsedCapacity() === 0)
    finishedWorking(s: RepairerProcessCreepStateCreep, m: RepairerProcess) {
        s.creep.memory.working = false;
        s.creep.say('harvesting');
    }

    @when<RepairerProcessCreepStateCreep>(s => !s.creep.memory.working && s.creep.store.getUsedCapacity() === s.creep.store.getCapacity())
    startedWorking(s: RepairerProcessCreepStateCreep, m: RepairerProcess) {
        s.creep.memory.working = true;
        s.creep.say('repairing');
    }

    @when<RepairerProcessCreepStateCreep>(s => s.creep.memory.working && !s.creep.memory.structureToRepairId && !s.nothingToUpgrade)
    findConstructionSite(s: RepairerProcessCreepStateCreep, m: RepairerProcess) {
        let structures = s.creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL)
        });

        if (!structures) {
            s.nothingToUpgrade = true;
            return s;
        }

        let targetStructure = _.sortBy(structures, s => s.hits / s.hitsMax)[0];

        s.creep.memory.structureToRepairId = targetStructure.id;

        return s;
    }

    @when<RepairerProcessCreepStateCreep>(s => s.creep.memory.working && s.creep.memory.structureToRepairId && !s.nothingToUpgrade)
    repair(s: RepairerProcessCreepStateCreep, m: RepairerProcess) {
        if (!s.creep.memory.structureToRepairId)
            return;

        const structureToRepair: Structure | null = Game.getObjectById<Structure>(s.creep.memory.structureToRepairId);

        if (!structureToRepair)
            return;

        if (structureToRepair.hits === structureToRepair.hitsMax) {
            delete s.creep.memory.structureToRepairId;
            return;
        }

        if (s.creep.repair(structureToRepair) === ERR_NOT_IN_RANGE) {
            s.creep.travelTo(structureToRepair);
        }

        m.exit();
    }

    @when<RepairerProcessCreepStateCreep>(s => s.nothingToUpgrade)
    build(s: RepairerProcessCreepStateCreep, m: RepairerProcess) {
        RoleBuilder.run(s.creep);
        m.exit()
    }

    @when<RepairerProcessCreepStateCreep>(s => !s.creep.memory.working)
    getEnergy(s: RepairerProcessCreepStateCreep, m: RepairerProcess) {
        RoleCommon.getEnergy(s.creep);
        m.exit();
    }
};
