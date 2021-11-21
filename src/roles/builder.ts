import { RoleUpgrader } from "./upgrader";

export class RoleBuilder {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {

        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvesting');
        }

        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('building');
        }

        if (creep.memory.working) {
            let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                RoleUpgrader.run(creep);
            }
        }
        else {
            var storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0) ||
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
}
