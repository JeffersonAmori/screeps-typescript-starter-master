import { RoleUpgrader } from "./upgrader";

export class RoleCommon {
    private static _prohibitedIds: string[] = [];

    /** @param {Creep} creep **/
    public static getEnergy(creep: Creep): void {
        if (creep.memory.targetEnergySourceId) {
            let targetEnergySource: Resource | Structure | Source | null = null;
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

            let ret = undefined;
            if (targetEnergySource instanceof Resource) {
                ret = creep.pickup(targetEnergySource);
            }
            else if (targetEnergySource instanceof Structure) {
                ret = creep.withdraw(targetEnergySource, RESOURCE_ENERGY, creep.store.getFreeCapacity());
            }
            else if (targetEnergySource instanceof Source) {
                ret = creep.harvest(targetEnergySource);
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
        else {
            let creepsWorkingSolo = _.filter(creep.room.find(FIND_MY_CREEPS), c => c.memory.targetEnergySourceId && c.memory.targetEnergySourceNeedsOnlyOneHarvester);
            if (creepsWorkingSolo && creepsWorkingSolo.length > 0)
                _.forEach(creepsWorkingSolo, c => RoleCommon._prohibitedIds.push(c.memory.targetEnergySourceId!));

            if (!RoleCommon.findStorage(creep)) {
                // If did not find energy...
                if (!RoleCommon.findDroppedEnery(creep)) {
                    // ...try to find a container
                    if (!RoleCommon.findContainer(creep)) {
                        // If did not find a container...
                        // ...try to find an energy source
                        RoleCommon.findEnergySource(creep)
                    }
                }
            }
        }
    }

    public static findEnergySource(creep: Creep): Source | undefined {
        var source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        if (source) {
            creep.memory.targetEnergySourceId = source.id;

            return source;
        }

        return undefined;
    }

    public static findContainer(creep: Creep): StructureContainer | undefined {
        let container: StructureContainer | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER &&
                        (structure.store.getUsedCapacity(RESOURCE_ENERGY) > structure.store.getCapacity(RESOURCE_ENERGY) / 2) &&
                        (RoleCommon._prohibitedIds.indexOf(structure.id) == -1));
            }
        })

        if (container) {
            creep.memory.targetEnergySourceId = container.id;

            if (creep.store.getFreeCapacity() >= container.store.getUsedCapacity()) {
                creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
            }

            return container;
        }

        return undefined;
    }


    public static findStorage(creep: Creep): StructureStorage | undefined {
        let storage: StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_STORAGE) &&
                        (structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity() &&
                        RoleCommon._prohibitedIds.indexOf(structure.id) == -1));
            }
        })

        if (storage) {
            creep.memory.targetEnergySourceId = storage.id;

            if (creep.store.getFreeCapacity() >= storage.store.getUsedCapacity()) {
                creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
            }
            return storage;
        }

        return undefined;
    }

    public static findDroppedEnery(creep: Creep): Resource<ResourceConstant> | undefined {
        // Find all energies
        let dropedEnergies : Resource<ResourceConstant>[] = creep.room.find(FIND_DROPPED_RESOURCES);
        // Find the energies allowed to be picked-up
        let allowedDropedEnergy = _.filter(dropedEnergies, e => RoleCommon._prohibitedIds.indexOf(e.id) == -1);
        // Find the closest one
        let closestEnergy = creep.pos.findClosestByPath(allowedDropedEnergy);
        // If found something...
        if (closestEnergy && !creep.memory.forceMoveToTargetContainer) {
            creep.memory.targetEnergySourceId = closestEnergy.id;

            if (creep.store.getFreeCapacity() >= closestEnergy.amount) {
                creep.memory.targetEnergySourceNeedsOnlyOneHarvester = true;
            }

            return closestEnergy;
        }

        return undefined;
    }

    public static deleteGetEnergyRelatedMemory(creep: Creep) {
        delete creep.memory.targetEnergySourceId;
        delete creep.memory.targetEnergySourceNeedsOnlyOneHarvester;
    }
}
