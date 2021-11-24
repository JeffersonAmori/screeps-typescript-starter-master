import { RoleUpgrader } from "./upgrader";

export class RoleCommon {

    private static deleteGetEnergyRelatedMemory(creep: Creep) {
        delete creep.memory.targetEnergySourceId;
        delete creep.memory.targetEnergySourceNeedsOnlyOneHarvester;
    }

    /** @param {Creep} creep **/
    public static getEnergy(creep: Creep): void {

        if (creep.memory.targetEnergySourceId) {
            let targetEnergySource = null;
            try {
                targetEnergySource = Game.getObjectById(creep.memory.targetEnergySourceId);

                if (!targetEnergySource) {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                    return;
                }
            }
            catch {
                RoleCommon.deleteGetEnergyRelatedMemory(creep);
                return;
            }
            finally {
            }

            if (targetEnergySource instanceof Resource) {
                if (creep.pickup(targetEnergySource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetEnergySource);
                } else {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                }
            }
            else if (targetEnergySource instanceof Structure) {
                if (creep.withdraw(targetEnergySource, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetEnergySource);
                } else {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                }
            }
            else if (targetEnergySource instanceof Source) {
                if (creep.harvest(targetEnergySource) == ERR_NOT_IN_RANGE)
                    creep.moveTo(targetEnergySource);

                if (creep.store.getFreeCapacity() == 0) {
                    RoleCommon.deleteGetEnergyRelatedMemory(creep);
                }
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
            let prohibitedIds: string[] = [];
            let creepsSolo = _.filter(creep.room.find(FIND_MY_CREEPS), c => c.memory.targetEnergySourceId && c.memory.targetEnergySourceNeedsOnlyOneHarvester);
            if (creepsSolo && creepsSolo.length > 0)
                _.forEach(creepsSolo, c => prohibitedIds.push(c.memory.targetEnergySourceId!));

            let storage: StructureStorage | StructureContainer | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_STORAGE) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity());
                }
            })
            if (storage) {
                creep.memory.targetEnergySourceId = storage.id;

                if (creep.store.getFreeCapacity() >= storage.store.getUsedCapacity()) {
                    creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
                }
            }
            else {
                // var tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES);
                // if (tombstone) {
                //     creep.memory.targetEnergySourceId = tombstone.id;
                // }
                // else {

                // Find all energies
                let dropedEnergies = creep.room.find(FIND_DROPPED_RESOURCES);
                // Find the energies allowed to be picked-up
                let allowedDropedEnergy = _.filter(dropedEnergies, e => prohibitedIds.indexOf(e.id) == -1);
                // Find the closest one
                let closestEnergy = creep.pos.findClosestByPath(allowedDropedEnergy);
                // If found something...
                if (closestEnergy && !creep.memory.forceMoveToTargetContainer) {
                    creep.memory.targetEnergySourceId = closestEnergy.id;

                    if (creep.store.getFreeCapacity() >= closestEnergy.amount) {
                        creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
                    }
                }
                // If did not find energy...
                else {
                    // ...try to find a container
                    let container: StructureStorage | StructureContainer | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > structure.store.getCapacity(RESOURCE_ENERGY) / 2);
                        }
                    })
                    if (container) {
                        creep.memory.targetEnergySourceId = container.id;

                        if (creep.store.getFreeCapacity() >= container.store.getUsedCapacity()) {
                            creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
                        }
                    }
                    // If did not find a container...
                    else {
                        // ...try to find an energy source
                        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                        if (!source) {
                            return;
                        }

                        creep.memory.targetEnergySourceId = source.id;
                    }
                }
            }
            // }
        }
    }
}
