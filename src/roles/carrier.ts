import { Consts } from "consts";
import { filter } from "lodash";

export class RoleCarrier {
    public static run(creep: Creep): void {
        /** @param {Creep} creep **/
        if (creep.memory.working) {
            if (!creep.memory.targetContainerId) {
                let sourceContainer = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER);
                    }
                });

                if (!sourceContainer || sourceContainer.length == 0)
                    return;

                let target: AnyStructure = _.max(sourceContainer, c => (<StructureContainer>c).store.getUsedCapacity());
                let targetContainer: StructureContainer = (<StructureContainer>target);
                creep.memory.targetContainerId = targetContainer.id;
                creep.memory.forceMoveToTargetContainer = targetContainer.store.getFreeCapacity() === 0;
            }

            // let sourceContainer: StructureContainer | null = Game.getObjectById<StructureContainer>(creep.memory.myContainerId);
            let dropedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);

            if (dropedEnergy && !creep.memory.forceMoveToTargetContainer) {
                if (creep.pickup(dropedEnergy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(dropedEnergy);
                }
            }
            else {
                let targetContainer = Game.getObjectById<StructureContainer>(creep.memory.targetContainerId);
                if (!targetContainer)
                    return;
                if (creep.withdraw(targetContainer, RESOURCE_ENERGY, creep.store.getFreeCapacity()) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetContainer);
                }
            }

            if (creep.store.getFreeCapacity() == 0) {
                creep.say('delivering');
                creep.memory.working = false;
                delete creep.memory.targetContainerId;
            }
        }
        else {
            let target: Structure | null = null;
            if (!creep.memory.otherResources) {
                let otherResources = _.filter(RESOURCES_ALL, r => r != RESOURCE_ENERGY && creep.store.getUsedCapacity(r) > 0);
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
                        return (structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > (structure.store.getCapacity(RESOURCE_ENERGY) / 2);
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
