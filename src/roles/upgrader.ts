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
            var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                }
            })
            if (!source)
                return;

            if (creep.withdraw(source, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
            // var source = creep.room.controller.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            // if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            //     creep.moveTo(source);
            // }
        }
    }
};
