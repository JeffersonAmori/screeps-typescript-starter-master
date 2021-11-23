import { RoleUpgrader } from "./upgrader";

export class RoleCommon {

    /** @param {Creep} creep **/
    public static getEnergy(creep: Creep): void {

        if (creep.memory.targetEnergySourceId) {
            let targetEnergySource = null;
            try {
                targetEnergySource = Game.getObjectById(creep.memory.targetEnergySourceId);

                if (!targetEnergySource) {
                    delete creep.memory.targetEnergySourceId;
                    return;
                }
            }
            catch {
            }
            finally {
                delete creep.memory.targetEnergySourceId;
            }

            if (targetEnergySource instanceof Resource) {
                if (creep.pickup(targetEnergySource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetEnergySource);
                } else {
                    delete creep.memory.targetEnergySourceId;
                }
            }
            else if (targetEnergySource instanceof Structure) {
                if (creep.withdraw(targetEnergySource, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetEnergySource);
                } else {
                    delete creep.memory.targetEnergySourceId;
                }
            }
            else if (targetEnergySource instanceof Source) {
                if (creep.harvest(targetEnergySource) == ERR_NOT_IN_RANGE)
                    creep.moveTo(targetEnergySource);

                if (creep.store.getFreeCapacity() == 0)
                    delete creep.memory.targetEnergySourceId;
            }
            // else if (targetEnergySource instanceof Tombstone) {
            //     if (targetEnergySource.creep.transfer(creep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            //         creep.moveTo(targetEnergySource);
            //     else {
            //             delete creep.memory.targetEnergySourceId;
            //     }
            // }
        }
        else {
            let dropedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            if (dropedEnergy && !creep.memory.forceMoveToTargetContainer) {
                creep.memory.targetEnergySourceId = dropedEnergy.id;
            }
            else {
                var tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES);
                if (tombstone) {
                    creep.memory.targetEnergySourceId = tombstone.id;
                }
                else {
                    var storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return ((structure.structureType == STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity()) ||
                                (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > structure.store.getCapacity(RESOURCE_ENERGY) / 2);
                        }
                    })
                    if (storage) {
                        creep.memory.targetEnergySourceId = storage.id;
                    }
                    else {
                        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                        if (!source) {
                            return;
                        }

                        creep.memory.targetEnergySourceId = source.id;
                    }
                }
            }
        }
    }
}
