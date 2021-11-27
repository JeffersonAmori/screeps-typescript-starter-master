import { Consts } from "consts";

export class RoleCommon {
    /** @param {Creep} creep **/
    public static getEnergy(creep: Creep): void {
        if (Consts.shouldRenewCreeps && creep.ticksToLive && (creep.ticksToLive < Consts.minTicksBeforeRepairing || creep.memory.isRenewing)) {
            this.renew(creep);
            return;
        }

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
            const storage = RoleCommon.findStorage(creep);
            const droppedEnergy = RoleCommon.findDroppedResource(creep);
            const container = RoleCommon.findContainer(creep);

            // Find the closest one
            let closestEnergySource = Number.MAX_VALUE;
            let closestLastKnownDistance = Number.MAX_VALUE;
            if (storage) {
                closestEnergySource = PathFinder.search(creep.pos, storage.pos).cost;
                if (closestEnergySource < closestLastKnownDistance) {
                    closestLastKnownDistance = closestEnergySource;
                    creep.memory.targetEnergySourceId = storage.id;
                }
            }

            if (droppedEnergy) {
                closestEnergySource = Math.min(closestEnergySource, PathFinder.search(creep.pos, droppedEnergy.pos).cost);
                if (closestEnergySource < closestLastKnownDistance) {
                    closestLastKnownDistance = closestEnergySource;
                    creep.memory.targetEnergySourceId = droppedEnergy.id;
                }
            }

            if (container) {
                closestEnergySource = Math.min(closestEnergySource, PathFinder.search(creep.pos, container.pos).cost);
                if (closestEnergySource < closestLastKnownDistance) {
                    closestLastKnownDistance = closestEnergySource;
                    creep.memory.targetEnergySourceId = container.id;
                }
            }

            if (closestEnergySource == Number.MAX_VALUE) {
                // If did not find a container...
                // ...try to find an energy source
                RoleCommon.findEnergySource(creep)
            }
        }
    }

    public static findEnergySource(creep: Creep): Source | undefined {
        const source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        if (source) {
            creep.memory.targetEnergySourceId = source.id;
            return source;
        }

        return undefined;
    }

    public static findContainer(creep: Creep): StructureContainer | undefined {
        const container: StructureContainer | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure => (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getFreeCapacity())
        })

        if (container) {
            creep.memory.targetEnergySourceId = container.id;
            return container;
        }

        return undefined;
    }

    public static findStorage(creep: Creep): StructureStorage | undefined {
        const storage: StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_STORAGE) &&
                    (structure.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getFreeCapacity()));
            }
        });

        if (storage) {
            creep.memory.targetEnergySourceId = storage.id;
            return storage;
        }

        return undefined;
    }

    public static findDroppedResource(creep: Creep): Resource<ResourceConstant> | undefined {
        // Find all energies
        const dropedEnergies: Resource<ResourceConstant>[] = creep.room.find(FIND_DROPPED_RESOURCES);
        // Find the closest one
        const closestEnergy = creep.pos.findClosestByPath(dropedEnergies);
        // If found something...
        if (closestEnergy && !creep.memory.forceMoveToTargetContainer) {
            creep.memory.targetEnergySourceId = closestEnergy.id;
            return closestEnergy;
        }

        return undefined;
    }

    public static findTombstone(creep: Creep): Tombstone | undefined {
        // Find all tombstones
        const tombstones: Tombstone[] = creep.room.find(FIND_TOMBSTONES);
        // Find the closest one
        const tombstone: Tombstone | null = creep.pos.findClosestByPath(tombstones);

        if (tombstone) {
            creep.memory.targetEnergySourceId = tombstone.id;
            return tombstone;
        }

        return undefined;
    }

    public static renew(creep: Creep) {
        if (!creep.ticksToLive)
            return;

        const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (spawn) {
            creep.memory.isRenewing = true;
            if (spawn.renewCreep(creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
            }
            else {
                if (creep.ticksToLive > 1400) {
                    delete creep.memory.isRenewing;
                }
            }
        }
    }

    public static deleteGetEnergyRelatedMemory(creep: Creep) {
        delete creep.memory.targetEnergySourceId;
    }
}
