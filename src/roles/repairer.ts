import { RoleBuilder } from "./builder";
import { RoleCommon } from "./_common";
import "libs/Traveler/Traveler";
import { StateMachine, when } from "when-ts";

interface RoleRepairerCreepStateCreep extends CreepState {
    nothingToUpgrade: boolean;
}

export class RoleRepairer extends StateMachine<RoleRepairerCreepStateCreep> {
    constructor(creep: Creep) {
        super({ creep: creep, nothingToUpgrade: false });
    }

    @when<RoleRepairerCreepStateCreep>(s => s.creep.memory.working && s.creep.store.getUsedCapacity() === 0)
    finishedWorking(s: RoleRepairerCreepStateCreep, m: RoleRepairer) {
        s.creep.memory.working = false;
        s.creep.say('harvesting');
    }

    @when<RoleRepairerCreepStateCreep>(s => !s.creep.memory.working && s.creep.store.getUsedCapacity() === s.creep.store.getCapacity())
    startedWorking(s: RoleRepairerCreepStateCreep, m: RoleRepairer) {
        s.creep.memory.working = true;
        s.creep.say('repairing');
    }

    @when<RoleRepairerCreepStateCreep>(s => s.creep.memory.working && !s.creep.memory.structureToRepairId && !s.nothingToUpgrade)
    findConstructionSite(s: RoleRepairerCreepStateCreep, m: RoleRepairer) {
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

    @when<RoleRepairerCreepStateCreep>(s => s.creep.memory.working && s.creep.memory.structureToRepairId && !s.nothingToUpgrade)
    repair(s: RoleRepairerCreepStateCreep, m: RoleRepairer) {
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

    @when<RoleRepairerCreepStateCreep>(s => s.nothingToUpgrade)
    build(s: RoleRepairerCreepStateCreep, m: RoleRepairer) {
        RoleBuilder.run(s.creep);
        m.exit()
    }

    @when<RoleRepairerCreepStateCreep>(s => !s.creep.memory.working)
    getEnergy(s: RoleRepairerCreepStateCreep, m: RoleRepairer) {
        RoleCommon.getEnergy(s.creep);
        m.exit();
    }

    // a function to run the logic for this role
    /** @param {Creep} creep */
    public static run(creep: Creep): void {

        // var dropedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);

        // if (dropedEnergy && creep.store.getFreeCapacity() == 0) {
        //     roleHarvester.run(creep);
        //     return;
        // }

        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            delete creep.memory.structureToRepairId;
            creep.say('harvesting');
        }

        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('repairing');
        }

        // if creep is supposed to repair something
        if (creep.memory.working == true) {
            if (!creep.memory.structureToRepairId) {
                let structures = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL)
                });

                if (!structures)
                    return;

                let targetStructure = _.sortBy(structures, s => s.hits / s.hitsMax)[0];

                creep.memory.structureToRepairId = targetStructure.id;
            }

            let structureToRepair: Structure | null = Game.getObjectById<Structure>(creep.memory.structureToRepairId);

            if (structureToRepair) {
                if (structureToRepair.hits == structureToRepair.hitsMax) {
                    delete creep.memory.structureToRepairId;
                    return;
                }

                if (creep.repair(structureToRepair) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(structureToRepair);
                }
            }
            else {
                RoleBuilder.run(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            RoleCommon.getEnergy(creep);
        }
    }
};
