import { Consts } from "consts";
import { CreepFactory } from "creepFactory";
import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";

export class MotherProcess extends Process {
    private _room: Room | null = null;

    public classPath() {
        return 'MotherProcess';
    }

    // _[0] - roomId
    public setup(..._: any): Process {
        this.memory.roomName = _[0];
        return this;
    }

    public run(): number {
        this._room = Game.rooms[this.memory.roomName];
        console.log('Mother run ' + this._room.name);
        if (!this._room) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        this.createCreeps();

        // const timeToSleep = this.getSleepTimer() - 100;
        // console.log('Time to sleep: ' + timeToSleep);

        // if (timeToSleep >= 100)
        this.kernel.sleepProcessByTime(this, 20);

        return 0;
    }

    createCreeps(): void {
        if (!this._room)
            return;

        const controller = this._room.controller;
        // if (controller && controller.level <= Consts.roomLevelCanReceivePioneers)
        //     return;

        const roomInfo = GlobalMemory.RoomInfo[this._room.name];

        const creepFactory: CreepFactory = new CreepFactory(this._room);
        const containers = this._room.find(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_CONTAINER) });
        const links = this._room.find(FIND_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_LINK) });
        const sources: Source[] | null = this._room.find(FIND_SOURCES);
        const extractors: StructureExtractor[] | null = this._room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_EXTRACTOR });
        const minerals: Mineral[] = this._room.find(FIND_MINERALS);

        const roomsCreeps = this._room.find(FIND_MY_CREEPS);

        const harvesters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleHarvester);
        const carriers = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleCarrier && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);
        const miners = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleMiner);
        const carriersTeleporters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleCarrierTeleporter && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);
        const minersTeleporters = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleMinerLinker);

        GlobalMemory.RoomInfo[this.memory.roomName].noActiveResourceHarvest = ((carriers.length + carriersTeleporters.length) === 0 || (miners.length + minersTeleporters.length) === 0) && (harvesters.length === 0);

        if (links.length > 0) {
            if (minersTeleporters.length < (links.length - 1)) {
                creepFactory.CreateCreep(Consts.roleMinerLinker);
            }

            if (carriersTeleporters.length < Consts.maxNumberCarrierTeleporter) {
                creepFactory.CreateCreep(Consts.roleCarrierTeleporter)
            }
        }

        if (containers.length > 0) {
            if (!GlobalMemory.RoomInfo[this._room.name].upgraderContainerId || !Game.getObjectById(GlobalMemory.RoomInfo[this._room.name].upgraderContainerId!)) {
                if (this._room.controller) {
                    const possibleContainers = this._room.controller.pos.findInRange(FIND_STRUCTURES, 5, { filter: c => c.structureType === STRUCTURE_CONTAINER });
                    if (possibleContainers.length > 0)
                        GlobalMemory.RoomInfo[this._room.name].upgraderContainerId = possibleContainers[0].id;
                }
            }

            if (miners.length < (Math.min(containers.length, sources.length) + extractors.length) - Math.max((links.length - 1), 0)) {
                creepFactory.CreateCreep(Consts.roleMiner)
            }

            if (carriers.length < (GlobalMemory.RoomInfo[this._room.name].sumOfDistancesToSourcesFromSpawnHeuristic)!) {
                creepFactory.CreateCreep(Consts.roleCarrier)
            }
        } else if (links.length === 0) {
            if (harvesters.length === 0) {
                creepFactory.CreateCreep(Consts.roleHarvester)
            }
        }

        const upgraders = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleUpgrader && c.ticksToLive && c.ticksToLive > Consts.minTicksBeforeSpawningReplacement);
        let additionalUpgrader = 0;
        let roomStorage = this._room.storage;
        let roomController = this._room.controller;
        if (roomStorage && roomController) {
            const energyStoredInRoom = roomStorage.store.getUsedCapacity();
            additionalUpgrader = energyStoredInRoom > roomController.level * 20000 ? 1 : 0;
        }
        if (upgraders.length < (Consts.maxNumberUpgrader /* + additionalUpgrader*/)) {
            creepFactory.CreateCreep(Consts.roleUpgrader)
        }


        // const repairer = _.filter(roomsCreeps, (c) => c.memory.role === Consts.roleRepairer);
        // if (repairer.length < Consts.maxNumberRepairer) {
        //     creepFactory.CreateCreep(Consts.roleRepairer)
        // }

        if (this._room.find(FIND_CONSTRUCTION_SITES).length > 0) {
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
            if (this._room === Game.flags.depositFlag.room) {
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

    getSleepTimer(): number {
        if (!this._room)
            return -1;

        const creepsInThisRoom: Creep[] | null = _.sortBy(this._room.find(FIND_MY_CREEPS), c => c.ticksToLive);
        if (creepsInThisRoom && creepsInThisRoom.length > 0) {
            const nextCreepToDie = creepsInThisRoom[0];
            if (nextCreepToDie.ticksToLive)
                return nextCreepToDie.ticksToLive;
        }

        return -1;
    }
}
