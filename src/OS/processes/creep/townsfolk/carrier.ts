import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";
import { profile } from "libs/Profiler-ts/Profiler";
import { Process } from "OS/kernel/process";
import { RoleCommon } from "roles/_common";
import * as _ from 'lodash';

@profile
export class CarrierProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "CarrierProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        return this;
    }

    public run(): number {
        this._creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (!this._creep) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        if (this._creep.memory.working) {
            if (!this._creep.memory.targetEnergySourceId) {
                this.workingButNoTargetEnergySourceId();
            }

            if (this._creep.memory.targetEnergySourceId) {
                this.workingWithTargetEnergySourceId();
            }
        }
        else {
            this.delivering();
        }

        return 0;
    }

    workingButNoTargetEnergySourceId() {
        if (!this._creep)
            return;

        const tombstone: Tombstone | undefined = RoleCommon.findTombstone(this._creep);
        if (tombstone && tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            this._creep.memory.targetEnergySourceId = tombstone.id;
        }
        else {
            const containers: StructureContainer[] | null = this._creep.room.find(FIND_STRUCTURES,
                { filter: structure => (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > this._creep!.store.getFreeCapacity()) && (this._creep && structure.id !== GlobalMemory.RoomInfo[this._creep.room.name].upgraderContainerId) });

            if (containers && containers.length > 0) {
                const closestContainer = _.sortBy(containers, c => c.store.getFreeCapacity())[0];

                const droppedEnergy = RoleCommon.findDroppedResource(this._creep);
                // Find the bigger one
                if (droppedEnergy) {
                    if (droppedEnergy.resourceType !== RESOURCE_ENERGY) {
                        this._creep.memory.targetEnergySourceId = droppedEnergy.id;
                    } else if (closestContainer.store.getUsedCapacity() > droppedEnergy?.amount) {
                        this._creep.memory.targetEnergySourceId = closestContainer.id;
                    } else {
                        this._creep.memory.targetEnergySourceId = droppedEnergy.id;
                    }
                }
                else {
                    this._creep.memory.targetEnergySourceId = closestContainer.id;
                }
            }
        }

        // As last resource uses the storage
        if (!this._creep.memory.targetEnergySourceId) {
            const storage: StructureStorage[] | null = this._creep.room.find(FIND_STRUCTURES,
                { filter: structure => (structure.structureType == STRUCTURE_STORAGE && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0) });
            if (storage && storage.length > 0)
                this._creep.memory.targetEnergySourceId = storage[0].id;
        }

    }

    workingWithTargetEnergySourceId() {
        if (!this._creep)
            return;

        if (this._creep.memory.targetEnergySourceId) {
            let targetEnergySource: Resource | StructureContainer | Tombstone | StructureStorage | null = Game.getObjectById(this._creep.memory.targetEnergySourceId);
            let ret = undefined;
            let energyRemaining: number = Number.MAX_VALUE;

            if (!targetEnergySource) {
                RoleCommon.deleteGetEnergyRelatedMemory(this._creep);
                return;
            }

            if (targetEnergySource.pos.inRangeTo(this._creep, 1)) {
                if (targetEnergySource instanceof Resource) {
                    ret = this._creep.pickup(targetEnergySource);
                    energyRemaining = targetEnergySource.amount;
                }
                else if (targetEnergySource instanceof StructureContainer || targetEnergySource instanceof Tombstone || targetEnergySource instanceof StructureStorage) {
                    ret = this._creep.withdraw(targetEnergySource, RESOURCE_ENERGY, Math.min(targetEnergySource.store.getUsedCapacity(RESOURCE_ENERGY), this._creep.store.getFreeCapacity()));
                    energyRemaining = targetEnergySource.store.getUsedCapacity();
                    if (ret === ERR_NOT_ENOUGH_ENERGY) {
                        RESOURCES_ALL.forEach(r => {
                            if (this._creep && targetEnergySource && (targetEnergySource instanceof StructureContainer || targetEnergySource instanceof Tombstone)) {
                                if (this._creep.withdraw(targetEnergySource, r) == OK)
                                    RoleCommon.deleteGetEnergyRelatedMemory(this._creep);
                            }
                        });
                    }
                }

                if (ret === ERR_NOT_IN_RANGE) {
                    this._creep.travelTo(targetEnergySource);
                }

                if (this._creep.store.getFreeCapacity() === 0 || energyRemaining === 0) {
                    RoleCommon.deleteGetEnergyRelatedMemory(this._creep);
                }
            } else {
                this._creep.travelTo(targetEnergySource);
            }

        }

        if (this._creep.store.getFreeCapacity() === 0) {
            this._creep.say('delivering ' + this._creep.name);
            this._creep.memory.working = false;
            RoleCommon.deleteGetEnergyRelatedMemory(this._creep);
            if (this._creep.memory.role !== Consts.roleCarrier)
                this.kernel.killProcess(this.pid);
        }
    }

    delivering() {
        if (!this._creep)
            return;

        let target: StructureExtension | StructureContainer | StructureTower | StructureStorage | null = null;

        if (this._creep.memory.targetEnergyDepositId) {
            target = Game.getObjectById<StructureExtension | StructureContainer | StructureTower | StructureStorage>(this._creep.memory.targetEnergyDepositId);
            if (target?.store.getFreeCapacity() === 0)
                target = null;
        }

        if (!target) {
            let otherResources = _.filter(RESOURCES_ALL, r => r !== RESOURCE_ENERGY && this._creep && this._creep.store.getUsedCapacity(r) > 0) as ResourceConstant[];
            this._creep.memory.otherResources = otherResources;

            if (this._creep.memory.otherResources.length > 0) {
                target = this._creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType === STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
            }
        }

        if (!target) {
            target = this._creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
        }

        if (!target) {
            target = this._creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType === STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= (structure.store.getCapacity(RESOURCE_ENERGY) / 2) });
        }

        if (!target) {
            if (GlobalMemory.RoomInfo[this._creep.room.name].upgraderContainerId) {
                const upgraderContainer = Game.getObjectById<StructureContainer>(GlobalMemory.RoomInfo[this._creep.room.name].upgraderContainerId!);
              if (upgraderContainer && upgraderContainer.store.getFreeCapacity() > 0)
                    target = upgraderContainer;
            }
        }

        if (!target) {
            target = this._creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
        }

         if (!target) {
             if (GlobalMemory.RoomInfo[this._creep.room.name].upgraderContainerId) {
                 const upgraderContainer = Game.getObjectById<StructureContainer>(GlobalMemory.RoomInfo[this._creep.room.name].upgraderContainerId!);
                 const storage = this._creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
                 if (upgraderContainer && storage)
                     target = <StructureExtension | StructureContainer | StructureTower | StructureStorage>this._creep.pos.findClosestByPath([upgraderContainer, storage]);
             } else {
                 target = this._creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
             }
         }

        if (target) {
            if (this._creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this._creep.memory.targetEnergyDepositId = target.id;
                this._creep.travelTo(target);
            } else {
                delete this._creep.memory.targetEnergyDepositId;
            }

            if (this._creep.memory.otherResources) {
                this._creep.memory.otherResources.forEach(oR => {
                    if (!this._creep)
                        return;

                    if (!target || !this._creep.memory.otherResources)
                        return;

                    this._creep.transfer(target, oR);
                    _.pull(this._creep.memory.otherResources, oR);
                });
            }

            if (this._creep.store.getUsedCapacity() == 0) {
                this._creep.say('getting');
                this._creep.memory.working = true;
                if (this._creep.memory.role !== Consts.roleCarrier)
                    this.kernel.killProcess(this.pid);
            }
        }
    }
}
