import { Process } from "OS/kernel/process";

export class RepairViaTowerProcess extends Process {

    public classPath(): string {
        return "RepairViaTowerProcess";
    }

    // _[0] - roomName
    setup(..._: any) {
        this.memory.roomName = _[0];
    }

    run(): number {
        if (!this.memory.roomName) {
            console.log('RepairViaTowerProcess - memory.roomName is no set.')
            return -1;
        }
        const currentRoom = Game.rooms[this.memory.roomName];
        const towers: StructureTower[] | null = currentRoom.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && (s.store.getUsedCapacity(RESOURCE_ENERGY)) > (s.store.getCapacity(RESOURCE_ENERGY) / 2) });
        if (!towers || towers.length === 0) {
            this.kernel.sleepProcessByTime(this, 50);
            return 0;
        }

        let structures = currentRoom.find(FIND_STRUCTURES, { filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL) });
        if (!structures || structures.length === 0) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        let targetStructure = _.sortBy(structures, s => s.hits / s.hitsMax)[0];

        if (!targetStructure) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        towers.forEach(t => t.repair(targetStructure));
        this.kernel.killProcess(this.pid);
        return 0;

    }
}
