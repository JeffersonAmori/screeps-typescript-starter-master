import { Consts } from "consts";
import { CreepFactory } from "creepFactory";
import { GlobalMemory } from "GlobalMemory";
import { RoomData, RoomInfo } from "roomInfo";

export class Mother {
    private _spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this._spawn = spawn;
    }

    public CreateCreeps(): void {
        let creepFactory: CreepFactory = new CreepFactory(this._spawn);
        let containers = this._spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER);
            }
        });

        let sources: Source[] | null = this._spawn.room.find(FIND_SOURCES);

        const carriers = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleCarrier);
        const miners = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleMiner);

        if (carriers.length == 0 || miners.length == 0)
            creepFactory.isEmergencyState = true;

        if (containers.length > 0) {

            let sumOfDistancesToSourcesFromSpawnHeuristic = 0;
            let currentRoomData = GlobalMemory.RoomInfo[this._spawn.room.name];
            if (currentRoomData && currentRoomData.sumOfDistancesToSourcesFromSpawnHeuristic) {
                sumOfDistancesToSourcesFromSpawnHeuristic = currentRoomData.sumOfDistancesToSourcesFromSpawnHeuristic;
            }
            else {
                let sumOfDistancesToSourcesFromSpawn: number = 0;
                sources.forEach(s => sumOfDistancesToSourcesFromSpawn += PathFinder.search(this._spawn.pos, s.pos).cost);
                sumOfDistancesToSourcesFromSpawnHeuristic = Math.ceil(sumOfDistancesToSourcesFromSpawn / 20);
                GlobalMemory.RoomInfo[this._spawn.room.name].sumOfDistancesToSourcesFromSpawnHeuristic = sumOfDistancesToSourcesFromSpawnHeuristic;
            }

            if (miners.length < Math.min(sources.length, containers.length)) {
                creepFactory.CreateCreep(Consts.roleMiner, { role: Consts.roleMiner, working: false, room: this._spawn.room.name, otherResources: [], myContainerId: Consts.topContainerId })
            }

            if (carriers.length < sumOfDistancesToSourcesFromSpawnHeuristic) {
                creepFactory.CreateCreep(Consts.roleCarrier, { role: Consts.roleCarrier, working: false, room: this._spawn.room.name, otherResources: [], myContainerId: '' })
            }
        } else {
            const harvesters = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleHarvester);
            if (harvesters.length == 0) {
                creepFactory.CreateCreep(Consts.roleHarvester, { role: Consts.roleHarvester, working: false, room: this._spawn.room.name, otherResources: [], myContainerId: Consts.topContainerId })
            }
        }

        const upgraders = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleUpgrader);
        let additionalUpgrader = 0;
        let roomStorage = this._spawn.room.storage;
        let roomController = this._spawn.room.controller;
        if (roomStorage && roomController) {
            const energyStoredInRoom = roomStorage.store.getUsedCapacity();
            additionalUpgrader = energyStoredInRoom > roomController.level * 20000 ? 1 : 0;
        }
        if (upgraders.length < (Consts.maxNumberUpgrader + additionalUpgrader)) {
            creepFactory.CreateCreep(Consts.roleUpgrader, { role: Consts.roleUpgrader, working: false, room: this._spawn.room.name, otherResources: [], myContainerId: '' })
        }

        const repairer = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleRepairer);
        if (repairer.length < Consts.maxNumberRepairer) {
            creepFactory.CreateCreep(Consts.roleRepairer, { role: Consts.roleRepairer, working: false, room: this._spawn.room.name, otherResources: [], myContainerId: '' })
        }

        if (this._spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            const builders = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role == Consts.roleBuilder);
            if (builders.length < Consts.maxNumberBuilder) {
                creepFactory.CreateCreep(Consts.roleBuilder, { role: Consts.roleBuilder, working: false, room: this._spawn.room.name, otherResources: [], myContainerId: '' })
            }
        }

        let controller = this._spawn.room.controller;
        if (controller) {
            let minLevelController = _.sortBy(Game.spawns, s => s.room.controller?.level)[0].room.controller?.level;
            if (minLevelController) {
                if (controller.level >= 4 && minLevelController < 4) {
                    const pioneers = _.filter(Game.creeps, (c) => c.memory.role == Consts.rolePioneer);
                    if (pioneers.length < Consts.maxNumberPioneer) {
                        creepFactory.CreateCreep(Consts.rolePioneer, { role: Consts.rolePioneer, working: false, room: this._spawn.room.name, otherResources: [], myContainerId: '' })
                    }

                    // const buildersForAntotherRoom = _.filter(Game.creeps, (c) => c.memory.role == Consts.roleBuilderForAnotherRoom);
                    // if (buildersForAntotherRoom.length < Consts.maxNumberBuilderForAnotherRoom) {
                    //     creepFactory.CreateCreep(Consts.roleBuilderForAnotherRoom, { role: Consts.roleBuilderForAnotherRoom, working: false, room: spawn.room.name, otherResources: [], myContainerId: '' })
                    // }

                    // const upgradersForAntotherRoom = _.filter(Game.creeps, (c) => c.memory.role == Consts.roleUpgraderForAnotherRoom);
                    // if (upgradersForAntotherRoom.length < Consts.maxNumberUpgradersForAnotherRoom) {
                    //     creepFactory.CreateCreep(Consts.roleUpgraderForAnotherRoom, { role: Consts.roleUpgraderForAnotherRoom, working: false, room: spawn.room.name, otherResources: [], myContainerId: '' })
                    // }

                    // const meleeFighterForAnotherRoom = _.filter(Game.creeps, (c) => c.memory.role == Consts.roleFighterMeleeForAnotherRoom);
                    // if (meleeFighterForAnotherRoom.length < Consts.maxNumberMeleeFightersForAnotherRoom) {
                    //     creepFactory.CreateCreep(Consts.roleFighterMeleeForAnotherRoom, { role: Consts.roleFighterMeleeForAnotherRoom, working: false, room: spawn.room.name, otherResources: [], myContainerId: '' })
                    // }
                }
            }
        }
    }
}
