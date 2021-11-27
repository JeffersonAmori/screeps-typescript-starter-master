import { RoleCommon } from "./_common";
import { Consts } from "consts";

export class RoleCarrier {
    public static run(creep: Creep): void {
        /** @param {Creep} creep **/

        if (Consts.shouldRenewCreeps && creep.ticksToLive && (creep.ticksToLive < Consts.minTicksBeforeRepairing || creep.memory.isRenewing)) {
            RoleCommon.renew(creep);
            return;
        }

        if (creep.memory.working) {
            if (!creep.memory.targetEnergySourceId) {
                const tombstone: Tombstone | undefined = RoleCommon.findTombstone(creep);
                if (tombstone && tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    creep.memory.targetEnergySourceId = tombstone.id;
                }
                else {
                    const containers: StructureContainer[] | null = creep.room.find(FIND_STRUCTURES,
                        { filter: structure => (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 0) });

                    if (containers && containers.length > 0) {
                        const closestContainer = _.sortBy(containers, c => c.store.getFreeCapacity())[0];

                        const droppedEnergy = RoleCommon.findDroppedResource(creep);
                        // Find the bigger one
                        if (droppedEnergy) {
                            if (droppedEnergy.resourceType !== RESOURCE_ENERGY) {
                                creep.memory.targetEnergySourceId = droppedEnergy.id;
                            } else if (closestContainer.store.getUsedCapacity() > droppedEnergy?.amount) {
                                creep.memory.targetEnergySourceId = closestContainer.id;
                            } else {
                                creep.memory.targetEnergySourceId = droppedEnergy.id;
                            }
                        }
                        else {
                            creep.memory.targetEnergySourceId = closestContainer.id;
                        }
                    }
                }
            }

            if (creep.memory.targetEnergySourceId) {
                let targetEnergySource: Resource | StructureContainer | Tombstone | null = Game.getObjectById(creep.memory.targetEnergySourceId);
                let ret = undefined;
                let energyRemaining: number = Number.MAX_VALUE;

                if (!targetEnergySource) {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                    return;
                }

                if (targetEnergySource instanceof Resource) {
                    ret = creep.pickup(targetEnergySource);
                    energyRemaining = targetEnergySource.amount;
                }
                else if (targetEnergySource instanceof StructureContainer || targetEnergySource instanceof Tombstone) {
                    ret = creep.withdraw(targetEnergySource, RESOURCE_ENERGY, Math.min(targetEnergySource.store.getUsedCapacity(RESOURCE_ENERGY), creep.store.getFreeCapacity()));
                    energyRemaining = targetEnergySource.store.getUsedCapacity();
                    if (ret === ERR_NOT_ENOUGH_ENERGY) {
                        RESOURCES_ALL.forEach(r => {
                            if (targetEnergySource && (targetEnergySource instanceof StructureContainer || targetEnergySource instanceof Tombstone)) {
                                creep.withdraw(targetEnergySource, r);
                            }
                        });
                    }
                }

                if (ret === ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetEnergySource);
                }

                if (creep.store.getFreeCapacity() === 0 && energyRemaining === 0) {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                }
            }

            if (creep.store.getFreeCapacity() == 0) {
                creep.say('delivering');
                creep.memory.working = false;
                RoleCommon.deleteGetEnergyRelatedMemory(creep);
            }
        }
        else {
            let target: Structure | null = null;
            let otherResources = _.filter(RESOURCES_ALL, r => r !== RESOURCE_ENERGY && creep.store.getUsedCapacity(r) > 0);
            creep.memory.otherResources = otherResources;

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
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure => (structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
            }

            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }

                if (creep.memory.otherResources) {
                    creep.memory.otherResources.forEach(oR => {
                        if (!target || !creep.memory.otherResources)
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
