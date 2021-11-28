import { Consts } from "consts";
import { CreepFactory } from "creepFactory";
import { link } from "fs";
import { GlobalMemory } from "GlobalMemory";
import { RoomData, RoomInfo } from "roomInfo";

export class Mother {
    private _spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this._spawn = spawn;
    }

    public CreateCreeps(): void {
        const creepFactory: CreepFactory = new CreepFactory(this._spawn);
        const containers = this._spawn.room.find(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_CONTAINER) });
        const links = this._spawn.room.find(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_LINK) });
        const sources: Source[] | null = this._spawn.room.find(FIND_SOURCES);
        const extractors: StructureExtractor[] | null = this._spawn.room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_EXTRACTOR });
        const minerals: Mineral[] = this._spawn.room.find(FIND_MINERALS);

        const roomsCreeps = this._spawn.room.find(FIND_MY_CREEPS);

        const carriers = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleCarrier);
        const miners = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleMiner);
        const carriersTeleporters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleCarrierTeleporter && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);
        const minersTeleporters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleMinerTeleporter && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);

        if ((carriers.length + carriersTeleporters.length) === 0 || (miners.length + minersTeleporters.length) === 0)
            creepFactory.isEmergencyState = true;

        if (links.length > 0) {
            GlobalMemory.RoomInfo[this._spawn.room.name].baseStructureLinkId = this._spawn.room.storage?.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK })?.id;

            if (minersTeleporters.length < (links.length - 1)) {
                creepFactory.CreateCreep(Consts.roleMinerTeleporter)
            }

            if (carriersTeleporters.length < Consts.maxNumberCarrierTeleporter) {
                creepFactory.CreateCreep(Consts.roleCarrierTeleporter)
            }
        }
        if (containers.length > 0) {
            let sumOfDistancesToSourcesFromSpawnHeuristic = 0;
            let currentRoomData = GlobalMemory.RoomInfo[this._spawn.room.name];
            if (currentRoomData && currentRoomData.sumOfDistancesToSourcesFromSpawnHeuristic) {
                sumOfDistancesToSourcesFromSpawnHeuristic = currentRoomData.sumOfDistancesToSourcesFromSpawnHeuristic;
            }
            else {
                let sumOfDistancesToSourcesFromSpawn: number = 0;
                const sourcesWithoutLink = _.filter(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK, ignoreCreeps: true })!.pos).path.length > 3);
                sourcesWithoutLink.forEach(s => sumOfDistancesToSourcesFromSpawn += PathFinder.search(this._spawn.pos, s.pos).cost);
                sumOfDistancesToSourcesFromSpawnHeuristic = Math.ceil(sumOfDistancesToSourcesFromSpawn / 20) + 1;
                GlobalMemory.RoomInfo[this._spawn.room.name].sumOfDistancesToSourcesFromSpawnHeuristic = sumOfDistancesToSourcesFromSpawnHeuristic;
            }

            if (miners.length < (sources.length + extractors.length) - (links.length - 1)) {
                creepFactory.CreateCreep(Consts.roleMiner)
            }

            if (carriers.length < (sumOfDistancesToSourcesFromSpawnHeuristic - (links.length - 1))) {
                creepFactory.CreateCreep(Consts.roleCarrier)
            }
        } else if (links.length === 0) {
            const harvesters = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role === Consts.roleHarvester);
            if (harvesters.length === 0) {
                creepFactory.CreateCreep(Consts.roleHarvester)
            }
        }

        const upgraders = _.filter(this._spawn.room.find(FIND_MY_CREEPS), (c) => c.memory.role === Consts.roleUpgrader);
        let additionalUpgrader = 0;
        let roomStorage = this._spawn.room.storage;
        let roomController = this._spawn.room.controller;
        if (roomStorage && roomController) {
            const energyStoredInRoom = roomStorage.store.getUsedCapacity();
            additionalUpgrader = energyStoredInRoom > roomController.level * 20000 ? 1 : 0;
        }
        if (upgraders.length < (Consts.maxNumberUpgrader + additionalUpgrader)) {
            creepFactory.CreateCreep(Consts.roleUpgrader)
        }

        const repairer = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleRepairer);
        if (repairer.length < Consts.maxNumberRepairer) {
            creepFactory.CreateCreep(Consts.roleRepairer)
        }

        if (this._spawn.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
            const builders = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleBuilder);
            if (builders.length < Consts.maxNumberBuilder) {
                creepFactory.CreateCreep(Consts.roleBuilder)
            }
        }

        let controller = this._spawn.room.controller;
        if (controller) {
            let minLevelController = _.sortBy(Game.spawns, s => s.room.controller?.level)[0].room.controller?.level;
            if (minLevelController) {
                if (controller.level >= Consts.roomLevelCanCreatePioneers && minLevelController <= Consts.roomLevelCanReceivePioneers) {
                    const pioneers = _.filter(Game.creeps, (c) => c.memory.role === Consts.rolePioneer);
                    if (pioneers.length < Consts.maxNumberPioneer) {
                        creepFactory.CreateCreep(Consts.rolePioneer)
                    }

                    // const meleeFighterForAnotherRoom = _.filter(Game.creeps, (c) => c.memory.role === Consts.roleFighterMeleeForAnotherRoom);
                    // if (meleeFighterForAnotherRoom.length < Consts.maxNumberMeleeFightersForAnotherRoom) {
                    //     creepFactory.CreateCreep(Consts.roleFighterMeleeForAnotherRoom, { role: Consts.roleFighterMeleeForAnotherRoom, working: false, room: spawn.room.name, otherResources: [], myContainerId: '' })
                    // }
                }
            }
        }

        if (Game.flags.pillageFlag && Game.flags.depositFlag) {
            if (this._spawn.room === Game.flags.depositFlag.room) {
                const pillagers = _.filter(Game.creeps, (c) => c.memory.role === Consts.rolePillager);
                if (pillagers.length < Consts.maxNumberPillager) {
                    creepFactory.CreateCreep(Consts.rolePillager);
                }
            }
        }
    }
}
