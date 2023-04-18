import { Process } from "OS/kernel/process";
import * as _ from 'lodash';

export class getEnergyProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "getEnergyProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]): Process {
        this.memory.creepId = _[0];
        return this;
    }
    public run(): number {
        this._creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (!this._creep) {
            this.kernel.killProcess(this.pid);
            return -1;
        }
        if (this._creep.memory.targetEnergySourceId) {
            let targetEnergySource: Resource | Structure | Source | null = null;
            try {
                targetEnergySource = Game.getObjectById(this._creep.memory.targetEnergySourceId);

                if (!targetEnergySource) {
                    this.deleteGetEnergyRelatedMemory();
                    return -1;
                }
            }
            catch {
                this.deleteGetEnergyRelatedMemory();
                return -1;
            }
            finally {
            }

            let ret = undefined;
            if (targetEnergySource instanceof Resource) {
                ret = this._creep.pickup(targetEnergySource);
            }
            else if (targetEnergySource instanceof Structure) {
                ret = this._creep.withdraw(targetEnergySource, RESOURCE_ENERGY, this._creep.store.getFreeCapacity());
            }
            else if (targetEnergySource instanceof Source) {
                ret = this._creep.harvest(targetEnergySource);
            }

            if (ret == ERR_NOT_IN_RANGE) {
                this._creep.moveTo(targetEnergySource);
            }
            else {
                this.deleteGetEnergyRelatedMemory();
            }

            if (this._creep.store.getFreeCapacity() == 0) {
                this.deleteGetEnergyRelatedMemory();
                this.kernel.killProcess(this.pid);
            }
        }
        else {
            const storage = this.findStorage();
            const droppedEnergy = this.findDroppedResource();
            const container = this.findContainer();

            // Find the closest one
            let closestEnergySource = Number.MAX_VALUE;
            let closestLastKnownDistance = Number.MAX_VALUE;
            if (storage) {
                closestEnergySource = PathFinder.search(this._creep.pos, storage.pos).cost;
                if (closestEnergySource < closestLastKnownDistance) {
                    closestLastKnownDistance = closestEnergySource;
                    this._creep.memory.targetEnergySourceId = storage.id;
                }
            }

            if (droppedEnergy) {
                closestEnergySource = Math.min(closestEnergySource, PathFinder.search(this._creep.pos, droppedEnergy.pos).cost);
                if (closestEnergySource < closestLastKnownDistance) {
                    closestLastKnownDistance = closestEnergySource;
                    this._creep.memory.targetEnergySourceId = droppedEnergy.id;
                }
            }

            if (container) {
                closestEnergySource = Math.min(closestEnergySource, PathFinder.search(this._creep.pos, container.pos).cost);
                if (closestEnergySource < closestLastKnownDistance) {
                    closestLastKnownDistance = closestEnergySource;
                    this._creep.memory.targetEnergySourceId = container.id;
                }
            }

            if (closestEnergySource == Number.MAX_VALUE) {
                // If did not find a container...
                // ...try to find an energy source
                this.findEnergySource()
            }
        }
        return 0;
    }

    public findEnergySource(): Source | undefined {
        if (!this._creep)
            return;
        const source = this._creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        if (source) {
            this._creep.memory.targetEnergySourceId = source.id;
            return source;
        }

        return undefined;
    }

    public findContainer(): StructureContainer | undefined {
        if (!this._creep)
            return;
        const container: StructureContainer | null = this._creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure => (structure.structureType == STRUCTURE_CONTAINER && this._creep && structure.store.getUsedCapacity(RESOURCE_ENERGY) >= this._creep.store.getFreeCapacity())
        })

        if (container) {
            this._creep.memory.targetEnergySourceId = container.id;
            return container;
        }

        return undefined;
    }

    public findStorage(): StructureStorage | undefined {
        if (!this._creep)
            return;
        const storage: StructureStorage | null = this._creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return ((structure.structureType == STRUCTURE_STORAGE) && this._creep &&
                    (structure.store.getUsedCapacity(RESOURCE_ENERGY) > this._creep.store.getFreeCapacity()));
            }
        });

        if (storage) {
            this._creep.memory.targetEnergySourceId = storage.id;
            return storage;
        }

        return undefined;
    }

    public findDroppedResource(): Resource<ResourceConstant> | undefined {
        if (!this._creep)
            return;
        // Find all energies
        const dropedEnergies: Resource<ResourceConstant>[] = _.filter(this._creep.room.find(FIND_DROPPED_RESOURCES), e => e.resourceType === RESOURCE_ENERGY);
        // Find the closest one
        const closestEnergy = this._creep.pos.findClosestByPath(dropedEnergies);
        // If found something...
        if (closestEnergy && !this._creep.memory.forceMoveToTargetContainer) {
            this._creep.memory.targetEnergySourceId = closestEnergy.id;
            return closestEnergy;
        }

        return undefined;
    }

    public findTombstone(): Tombstone | undefined {
        if (!this._creep)
            return;
        // Find all tombstones
        const tombstones: Tombstone[] = this._creep.room.find(FIND_TOMBSTONES);
        // Find the closest one
        const tombstone: Tombstone | null = this._creep.pos.findClosestByPath(tombstones);

        if (tombstone) {
            this._creep.memory.targetEnergySourceId = tombstone.id;
            return tombstone;
        }

        return undefined;
    }

    public deleteGetEnergyRelatedMemory() {
        if (!this._creep)
            return;
        delete this._creep.memory.targetEnergySourceId;
    }
}
