import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";
import { MachineState, when } from "when-ts";

export class UpdateOwnedRoomInfo extends Process<MachineState>{
    public classPath(): string {
        return "UpdateOwnedRoomInfo";
    }

    // _[0] - roomName
    public setup(..._: any[]) {
        this.memory.roomName = _[0];
    }

    @when<MachineState>(true)
    resetRoomInfo(s: MachineState, m: UpdateOwnedRoomInfo) {
        console.log('updateOwnedRoomInfo ' + this.memory.roomName);
        const currentRoom = Game.rooms[this.memory.roomName];
        if (!currentRoom || !currentRoom.controller || !currentRoom.controller.my) {
            this.kernel.killProcess(this.pid);
            m.exit();
            return;
        }

        const spawns: StructureSpawn[] = currentRoom.find(FIND_MY_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_SPAWN) });
        const spawn: StructureSpawn | null = spawns && spawns.length > 0 ? spawns[0] : null;
        const storages: StructureStorage[] = currentRoom.find(FIND_MY_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_STORAGE) });
        const storage: StructureStorage | null = storages && storages.length > 0 ? storages[0] : null;

        const home: Structure | null = storage || spawn;
        if (!home) {
            this.kernel.killProcess(this.pid);
            m.exit();
            return;
        }

        const links: StructureLink[] = currentRoom.find(FIND_MY_STRUCTURES, { filter: structure => (structure.structureType === STRUCTURE_LINK) });
        const sources: Source[] | null = currentRoom.find(FIND_SOURCES);

        let sumOfDistancesToSourcesFromSpawn: number = 0;
        let sourcesWithoutLink = sources;
        if (links && links.length > 0 && sources && sources.length > 0)
            sourcesWithoutLink = _.filter(sources, source => source.pos.inRangeTo(source.pos.findClosestByPath(links)!.pos, 3));
        sourcesWithoutLink.forEach(s => sumOfDistancesToSourcesFromSpawn += PathFinder.search(home.pos, s.pos).path.length);
        let sumOfDistancesToSourcesFromSpawnHeuristic = Math.ceil(sumOfDistancesToSourcesFromSpawn / 20);
        GlobalMemory.RoomInfo[currentRoom.name].sumOfDistancesToSourcesFromSpawnHeuristic = sumOfDistancesToSourcesFromSpawnHeuristic;
        console.log('updateOwnedRoomInfo calculated ' + this.memory.roomName);

        this.kernel.killProcess(this.pid);
        m.exit();
    }
}
