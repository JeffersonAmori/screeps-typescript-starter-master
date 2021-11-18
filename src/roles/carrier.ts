export class RoleCarrier {
    public static run(creep: Creep): void {
        /** @param {Creep} creep **/
        if (creep.memory.working) {
            let sourceContainer: StructureContainer | null = Game.getObjectById<StructureContainer>(creep.memory.myContainerId);
            let dropedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            let targetHarvesterStandStill: Creep | null = creep.pos.findClosestByPath(FIND_CREEPS, {
                filter: (c) => {
                    return (c.memory.myContainerId == creep.memory.myContainerId && c.memory.role == 'harvesterStandStill');
                }
            });

            if (!sourceContainer)
                return;

            if (!targetHarvesterStandStill)
                return;

            if (dropedEnergy) {
                if (creep.pickup(dropedEnergy) == ERR_NOT_IN_RANGE) {
                    if (creep.withdraw(sourceContainer, RESOURCE_ENERGY, creep.store.getFreeCapacity()) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetHarvesterStandStill);
                    }
                }
            }
            else {
                if (creep.withdraw(sourceContainer, RESOURCE_ENERGY, creep.store.getFreeCapacity()) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetHarvesterStandStill);
                }
            }

            if (creep.store.getFreeCapacity() == 0) {
                creep.say('delivering');
                creep.memory.working = false;
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

                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                    creep.say('getting');
                    creep.memory.working = true;
                }
            }

        }
    }
};
