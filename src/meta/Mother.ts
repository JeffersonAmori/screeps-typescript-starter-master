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
        const controller = this._spawn.room.controller;
        if (controller && controller.level <= Consts.roomLevelCanReceivePioneers)
            return;


        const creepFactory: CreepFactory = new CreepFactory(this._spawn);
        const containers = this._spawn.room.find(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_CONTAINER) });
        const links = this._spawn.room.find(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_LINK) });
        const sources: Source[] | null = this._spawn.room.find(FIND_SOURCES);
        const extractors: StructureExtractor[] | null = this._spawn.room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_EXTRACTOR });
        const minerals: Mineral[] = this._spawn.room.find(FIND_MINERALS);


        const roomsCreeps = this._spawn.room.find(FIND_MY_CREEPS);

        const harvesters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleHarvester);
        const carriers = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleCarrier && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);
        const miners = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleMiner);
        const carriersTeleporters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleCarrierTeleporter && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);
        const minersTeleporters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleMinerTeleporter);

        if (((carriers.length + carriersTeleporters.length) === 0 || (miners.length + minersTeleporters.length) === 0) && (harvesters.length === 0))
            creepFactory.isEmergencyState = true;

        if (links.length > 0) {
            if (!GlobalMemory.RoomInfo[this._spawn.room.name].baseStructureLinkId)
                GlobalMemory.RoomInfo[this._spawn.room.name].baseStructureLinkId = this._spawn.room.storage?.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK })?.id;

            if (minersTeleporters.length < (links.length - 1)) {
                creepFactory.CreateCreep(Consts.roleMinerTeleporter)
            }

            if (carriersTeleporters.length < Consts.maxNumberCarrierTeleporter) {
                creepFactory.CreateCreep(Consts.roleCarrierTeleporter)
            }
        }

        if (containers.length > 0) {
            if (!GlobalMemory.RoomInfo[this._spawn.room.name].upgraderContainerId) {
                if (this._spawn.room.controller) {
                    const possibleContainers = this._spawn.room.controller.pos.findInRange(FIND_STRUCTURES, 5, { filter: c => c.structureType === STRUCTURE_CONTAINER });
                    if(possibleContainers.length > 0)
                    GlobalMemory.RoomInfo[this._spawn.room.name].upgraderContainerId = possibleContainers[0].id;
                }
            }

            let sumOfDistancesToSourcesFromSpawnHeuristic = 0;
            let currentRoomData = GlobalMemory.RoomInfo[this._spawn.room.name];
            if (currentRoomData && currentRoomData.sumOfDistancesToSourcesFromSpawnHeuristic) {
                sumOfDistancesToSourcesFromSpawnHeuristic = currentRoomData.sumOfDistancesToSourcesFromSpawnHeuristic;
            }
            else {
                let sumOfDistancesToSourcesFromSpawn: number = 0;
                let sourcesWithoutLink = sources;
                if (links && links.length > 0)
                    sourcesWithoutLink = _.filter(sources, source => PathFinder.search(source.pos, source.pos.findClosestByPath(links)!.pos).path.length > 3);
                sourcesWithoutLink.forEach(s => sumOfDistancesToSourcesFromSpawn += PathFinder.search(this._spawn.pos, s.pos).path.length);
                sumOfDistancesToSourcesFromSpawnHeuristic = Math.ceil(sumOfDistancesToSourcesFromSpawn / 20);
                GlobalMemory.RoomInfo[this._spawn.room.name].sumOfDistancesToSourcesFromSpawnHeuristic = sumOfDistancesToSourcesFromSpawnHeuristic;
            }

            if (miners.length < (Math.min(containers.length, sources.length) + extractors.length) - Math.max((links.length - 1), 0)) {
                creepFactory.CreateCreep(Consts.roleMiner)
            }

            if (carriers.length < (sumOfDistancesToSourcesFromSpawnHeuristic)) {
                creepFactory.CreateCreep(Consts.roleCarrier)
            }
        } else if (links.length === 0) {
            if (harvesters.length === 0) {
                creepFactory.CreateCreep(Consts.roleHarvester)
            }
        }

        const upgraders = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleUpgrader && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);
        let additionalUpgrader = 0;
        let roomStorage = this._spawn.room.storage;
        let roomController = this._spawn.room.controller;
        if (roomStorage && roomController) {
            const energyStoredInRoom = roomStorage.store.getUsedCapacity();
            additionalUpgrader = energyStoredInRoom > roomController.level * 20000 ? 1 : 0;
        }
        if (upgraders.length < (Consts.maxNumberUpgrader /*+ additionalUpgrader*/)) {
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

        if (controller) {
            let minLevelController = _.sortBy(Game.spawns, s => s.room.controller?.level)[0].room.controller?.level;
            if (minLevelController) {
                if (controller.level >= Consts.roomLevelCanCreatePioneers && (minLevelController <= Consts.roomLevelCanReceivePioneers || Game.flags.colonizeFlag)) {
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

        if (Game.flags.attackFlag) {
            const soldiers = _.filter(Game.creeps, (c) => c.memory.role === Consts.roleSoldier);
            if (soldiers.length < Consts.maxNumberSoldier) {
                creepFactory.CreateCreep(Consts.roleSoldier);
            }
        }
    }
}
