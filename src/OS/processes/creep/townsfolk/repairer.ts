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
    noMoreCreep(s: CreepState, m: RepairerProcess){
        this.status = ProcessStatus.DEAD;

        m.exit();
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

    // // a function to run the logic for this role
    // /** @param {Creep} creep */
    // public static run(creep: Creep): void {

    //     // var dropedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);

    //     // if (dropedEnergy && creep.store.getFreeCapacity() == 0) {
    //     //     roleHarvester.run(creep);
    //     //     return;
    //     // }

    //     if (creep.memory.working && creep.carry.energy == 0) {
    //         creep.memory.working = false;
    //         delete creep.memory.structureToRepairId;
    //         creep.say('harvesting');
    //     }

    //     if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
    //         creep.memory.working = true;
    //         creep.say('repairing');
    //     }

    //     // if creep is supposed to repair something
    //     if (creep.memory.working == true) {
    //         if (!creep.memory.structureToRepairId) {
    //             let structures = creep.room.find(FIND_STRUCTURES, {
    //                 filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL)
    //             });

    //             if (!structures)
    //                 return;

    //             let targetStructure = _.sortBy(structures, s => s.hits / s.hitsMax)[0];

    //             creep.memory.structureToRepairId = targetStructure.id;
    //         }

    //         let structureToRepair: Structure | null = Game.getObjectById<Structure>(creep.memory.structureToRepairId);

    //         if (structureToRepair) {
    //             if (structureToRepair.hits == structureToRepair.hitsMax) {
    //                 delete creep.memory.structureToRepairId;
    //                 return;
    //             }

    //             if (creep.repair(structureToRepair) == ERR_NOT_IN_RANGE) {
    //                 creep.travelTo(structureToRepair);
    //             }
    //         }
    //         else {
    //             RoleBuilder.run(creep);
    //         }
    //     }
    //     // if creep is supposed to get energy
    //     else {
    //         RoleCommon.getEnergy(creep);
    //     }
    // }
};
