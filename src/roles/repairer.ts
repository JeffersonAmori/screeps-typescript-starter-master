import { RoleBuilder } from "./builder";

export class RoleRepairer {
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

            let structureToRepair : Structure | null = Game.getObjectById<Structure>(creep.memory.structureToRepairId);

            if (structureToRepair) {
                if (creep.repair(structureToRepair) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(structureToRepair);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                RoleBuilder.run(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            var storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()) ||
                            (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > structure.store.getCapacity(RESOURCE_ENERGY) / 2);
                }
            })
            if (storage) {
                if (creep.withdraw(storage, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(storage);
                }
            } else {
                var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                if (!source) {
                    return;
                }

                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
    }
};
