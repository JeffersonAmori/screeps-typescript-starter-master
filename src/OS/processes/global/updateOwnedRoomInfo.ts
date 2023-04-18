import { GlobalMemory } from "GlobalMemory";
import { profile } from "libs/Profiler-ts";
import { Process } from "OS/kernel/process";
import * as _ from 'lodash';

@profile
export class UpdateOwnedRoomInfo extends Process {
    public classPath(): string {
        return "UpdateOwnedRoomInfo";
    }

    // _[0] - roomName
    public setup(..._: any[]) {
        this.memory.roomName = _[0];
        return this;
    }

    links: StructureLink[] = []
    spawn: StructureSpawn | null = null;
    spawns: StructureSpawn[] = []
    sources: Source[] | null = []
    storage: StructureStorage | null = null;
    storages: StructureStorage[] = []

    public run(): number {
        console.log('Running UpdateOwnedRoomInfo');
        if (!this.memory.roomName) {
            this.kernel.killProcess(this.pid);
        }

        const room = Game.rooms[this.memory.roomName];

        // Setup
        this.spawns = room.find(FIND_MY_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_SPAWN) });
        this.spawn = this.spawns && this.spawns.length > 0 ? this.spawns[0] : null;
        this.storages = room.find(FIND_MY_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_STORAGE) });
        this.storage = this.storages && this.storages.length > 0 ? this.storages[0] : null;
        this.links = room.find(FIND_MY_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_LINK) });
        this.sources = room.find(FIND_SOURCES);

        // Updates to the room's info
        this.calculateAmountOfCarriersNeededOnRoom(room);
        this.findStorageLink(room);

        this.kernel.killProcess(this.pid);

        return 0;
    }

    calculateAmountOfCarriersNeededOnRoom(room: Room): void {
        if (!room || !room.controller || !room.controller.my || !this.sources) {
            return;
        }

        const home: Structure | null = this.storage || this.spawn;
        if (!home) {
            return;
        }

        let sumOfDistancesToSourcesFromSpawn: number = 0;
        let sourcesWithoutLink = this.sources;
        if (this.links && this.links.length > 0 && this.sources && this.sources.length > 0)
            sourcesWithoutLink = _.filter(this.sources, source => !source.pos.inRangeTo(source.pos.findClosestByPath(this.links)!.pos, 3));
        sourcesWithoutLink.forEach(s => sumOfDistancesToSourcesFromSpawn += PathFinder.search(home.pos, s.pos).path.length);
        if (GlobalMemory.RoomInfo[room.name].upgraderContainerId && Game.getObjectById<StructureContainer>(GlobalMemory.RoomInfo[room.name].upgraderContainerId!)) {
            const upgraderContainer = Game.getObjectById<StructureContainer>(GlobalMemory.RoomInfo[room.name].upgraderContainerId!);
            if (upgraderContainer)
                sumOfDistancesToSourcesFromSpawn += PathFinder.search(upgraderContainer.pos, upgraderContainer.pos.findClosestByRange(sourcesWithoutLink)!.pos).path.length;
        }
        let sumOfDistancesToSourcesFromSpawnHeuristic = Math.ceil(sumOfDistancesToSourcesFromSpawn / 20);
        GlobalMemory.RoomInfo[room.name].sumOfDistancesToSourcesFromSpawnHeuristic = sumOfDistancesToSourcesFromSpawnHeuristic;
        return;
    }

    findStorageLink(room: Room) {
        if (!this.storage)
            return;

        GlobalMemory.RoomInfo[room.name].storageLinkId = this.storage.pos.findClosestByPath(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_LINK })?.id;
        return;
    }
}
