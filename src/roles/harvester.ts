export class RoleHarvester {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == creep.store.getCapacity(RESOURCE_ENERGY)) {
            creep.say('transfering');
            creep.memory.working = false;
        }

        if (creep.memory.working) {
            let dropedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if (dropedEnergy) {
                if (creep.pickup(dropedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropedEnergy);
                }
            } else {
                let source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                if (!source) {
                    return;
                }

                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source);
                }
            }
        }
        else {
            let target: Structure | null = null;
            if (!creep.memory.otherResources) {
                let otherResources = _.filter(RESOURCES_ALL, r => r != RESOURCE_ENERGY && creep.store.getUsedCapacity(r) > 0)
                creep.memory.otherResources = otherResources;
            }

            if (creep.memory.otherResources.length > 0) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                })
            }

            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }

            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }

            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (//structure.structureType == STRUCTURE_CONTAINER ||
                            structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }

                if (creep.memory.otherResources) {
                    creep.memory.otherResources.forEach(oR => {
                        if (!target)
                            return;

                        creep.transfer(target, oR);
                        _.pull(creep.memory.otherResources, oR);
                    });
                }

                if (creep.store.getUsedCapacity() == 0) {
                    creep.say('harvesting');
                    creep.memory.working = true;
                }
            }
        }
    }
};
