import { RoleCommon } from "./_common";
import { Traveler } from "../libs/Traveler/Traveler";

export class RoleCarrier {
    public static run(creep: Creep): void {
        /** @param {Creep} creep **/
        if (creep.memory.working) {
            if (!creep.memory.targetEnergySourceId) {
                let containers: StructureContainer[] | null = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER);
                    }
                })

                if (containers && containers.length > 0) {
                    let container = _.sortBy(containers, c => c.store.getFreeCapacity())[0];

                    const droppedEnergy = RoleCommon.findDroppedEnergy(creep);
                    // Find the closest one
                    if (droppedEnergy) {
                        if (container.store.getUsedCapacity() > droppedEnergy?.amount) {
                            creep.memory.targetEnergySourceId = container.id;

                            if (creep.store.getFreeCapacity() >= container.store.getUsedCapacity()) {
                                creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
                            }
                        } else {
                            creep.memory.targetEnergySourceId = droppedEnergy.id;

                            if (creep.store.getFreeCapacity() >= droppedEnergy.amount) {
                                creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
                            }
                        }
                    }
                    else {
                        creep.memory.targetEnergySourceId = container.id;

                        if (creep.store.getFreeCapacity() >= container.store.getUsedCapacity()) {
                            creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
                        }
                    }
                }
            }
            else {
                let targetEnergySource: Resource | Structure | null = Game.getObjectById(creep.memory.targetEnergySourceId);
                let ret = undefined;

                if (!targetEnergySource) {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                    return;
                }

                if (targetEnergySource instanceof Resource) {
                    ret = creep.pickup(targetEnergySource);
                }
                else if (targetEnergySource instanceof Structure) {
                    ret = creep.withdraw(targetEnergySource, RESOURCE_ENERGY, creep.store.getFreeCapacity());
                }

                if (ret == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetEnergySource);
                }
                else {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                }

                if (creep.store.getFreeCapacity() == 0) {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                }

            }

            if (creep.store.getFreeCapacity() == 0) {
                creep.say('delivering');
                creep.memory.working = false;
                delete creep.memory.targetEnergySourceId;
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
                    //Traveler.travelTo(creep, target);
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
