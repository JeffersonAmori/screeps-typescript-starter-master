export class RoleUpgrader {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {

        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvesting');
        }
        else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('upgrading');
        }

        if (creep.memory.working) {
            const controller = creep.room.controller;
            if (!controller)
                return;

            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(controller);
            }
        }
        else {
            var storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE ||
                            structure.structureType == STRUCTURE_SPAWN) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
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
