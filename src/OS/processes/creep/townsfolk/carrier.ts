import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";
import { RoleCommon } from "roles/_common";
import { when } from "when-ts";

export class CarrierProcess extends Process<CreepState>{

    public classPath(): string {
        return "CarrierProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        this.setInitialState({ creep: Game.getObjectById<Creep>(this.memory.creepId)! })
    }

    @when<CreepState>(c => !c.creep)
    noCreepDefined(s: CreepState, m: CarrierProcess) {
        const creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (creep) {
            s.creep = creep;
            return s;
        } else {
            this.kernel.killProcess(this.pid);
            m.exit();
        }

        m.exit();
        return s;
    }

    @when<CreepState>(c => c.creep.memory.working && !c.creep.memory.targetEnergySourceId)
    workingButNoTargetEnergySourceId(c: CreepState, m: CarrierProcess) {
        const tombstone: Tombstone | undefined = RoleCommon.findTombstone(c.creep);
        if (tombstone && tombstone.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            c.creep.memory.targetEnergySourceId = tombstone.id;
        }
        else {
            const containers: StructureContainer[] | null = c.creep.room.find(FIND_STRUCTURES,
                { filter: structure => (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity() > 0) && (structure.id !== GlobalMemory.RoomInfo[c.creep.room.name].upgraderContainerId) });

            if (containers && containers.length > 0) {
                const closestContainer = _.sortBy(containers, c => c.store.getFreeCapacity())[0];

                const droppedEnergy = RoleCommon.findDroppedResource(c.creep);
                // Find the bigger one
                if (droppedEnergy) {
                    if (droppedEnergy.resourceType !== RESOURCE_ENERGY) {
                        c.creep.memory.targetEnergySourceId = droppedEnergy.id;
                    } else if (closestContainer.store.getUsedCapacity() > droppedEnergy?.amount) {
                        c.creep.memory.targetEnergySourceId = closestContainer.id;
                    } else {
                        c.creep.memory.targetEnergySourceId = droppedEnergy.id;
                    }
                }
                else {
                    c.creep.memory.targetEnergySourceId = closestContainer.id;
                }
            }
        }

        m.exit();
    }

    @when<CreepState>(c => c.creep.memory.working && c.creep.memory.targetEnergySourceId)
    workingWithTargetEnergySourceId(c: CreepState, m: CarrierProcess) {
        if (c.creep.memory.targetEnergySourceId) {
            let targetEnergySource: Resource | StructureContainer | Tombstone | null = Game.getObjectById(c.creep.memory.targetEnergySourceId);
            let ret = undefined;
            let energyRemaining: number = Number.MAX_VALUE;

            if (!targetEnergySource) {
                RoleCommon.deleteGetEnergyRelatedMemory(c.creep);
                m.exit();
                return;
            }

            if (targetEnergySource instanceof Resource) {
                ret = c.creep.pickup(targetEnergySource);
                energyRemaining = targetEnergySource.amount;
            }
            else if (targetEnergySource instanceof StructureContainer || targetEnergySource instanceof Tombstone) {
                ret = c.creep.withdraw(targetEnergySource, RESOURCE_ENERGY, Math.min(targetEnergySource.store.getUsedCapacity(RESOURCE_ENERGY), c.creep.store.getFreeCapacity()));
                energyRemaining = targetEnergySource.store.getUsedCapacity();
                if (ret === ERR_NOT_ENOUGH_ENERGY) {
                    RESOURCES_ALL.forEach(r => {
                        if (targetEnergySource && (targetEnergySource instanceof StructureContainer || targetEnergySource instanceof Tombstone)) {
                            c.creep.withdraw(targetEnergySource, r);
                        }
                    });
                }
            }

            if (ret === ERR_NOT_IN_RANGE) {
                c.creep.travelTo(targetEnergySource);
            }

            if (c.creep.store.getFreeCapacity() === 0 || energyRemaining === 0) {
                RoleCommon.deleteGetEnergyRelatedMemory(c.creep);
            }
        }

        if (c.creep.store.getFreeCapacity() == 0) {
            c.creep.say('delivering ' + c.creep.name);
            c.creep.memory.working = false;
            RoleCommon.deleteGetEnergyRelatedMemory(c.creep);
        }

        m.exit();
    }

    @when<CreepState>(c => !c.creep.memory.working)
    notWorking(c: CreepState, m: CarrierProcess) {
        let target: StructureExtension | StructureContainer | StructureTower | StructureStorage | null = null;

        if (c.creep.memory.targetEnergyDepositId) {
            target = Game.getObjectById<StructureExtension | StructureContainer | StructureTower | StructureStorage>(c.creep.memory.targetEnergyDepositId);
            if (target?.store.getFreeCapacity() === 0)
                target = null;
        }

        if (!target) {
            let otherResources = _.filter(RESOURCES_ALL, r => r !== RESOURCE_ENERGY && c.creep.store.getUsedCapacity(r) > 0);
            c.creep.memory.otherResources = otherResources;

            if (c.creep.memory.otherResources.length > 0) {
                target = c.creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
            }
        }

        if (!target) {
            target = c.creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) >= (structure.store.getCapacity(RESOURCE_ENERGY) / 2) });
        }

        if (!target) {
            target = c.creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
        }

        if (!target) {
            if (GlobalMemory.RoomInfo[c.creep.room.name].upgraderContainerId) {
                const upgraderContainer = Game.getObjectById<StructureContainer>(GlobalMemory.RoomInfo[c.creep.room.name].upgraderContainerId!);
                const storage = c.creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure => (structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
                if (upgraderContainer && storage)
                    target = <StructureExtension | StructureContainer | StructureTower | StructureStorage>c.creep.pos.findClosestByPath([upgraderContainer, storage]);
            } else {
                target = c.creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: structure => (structure.structureType == STRUCTURE_STORAGE) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 });
            }
        }

        if (target) {
            if (c.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                c.creep.memory.targetEnergyDepositId = target.id;
                c.creep.travelTo(target);
            } else {
                delete c.creep.memory.targetEnergyDepositId;
            }

            if (c.creep.memory.otherResources) {
                c.creep.memory.otherResources.forEach(oR => {
                    if (!target || !c.creep.memory.otherResources) {
                        m.exit();
                        return;
                    }

                    c.creep.transfer(target, oR);
                    _.pull(c.creep.memory.otherResources, oR);
                });
            }

            if (c.creep.store.getUsedCapacity() == 0) {
                c.creep.say('getting');
                c.creep.memory.working = true;
            }
        }

        m.exit();
    }
}
