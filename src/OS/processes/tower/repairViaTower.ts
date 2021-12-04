import { Process } from "OS/kernel/process";
import { MachineState, when } from "when-ts";

export class RepairViaTowerProcess extends Process<MachineState>{

    public classPath(): string {
        return "RepairViaTowerProcess";
    }

    // _[0] - roomName
    setup(..._: any) {
        this.memory.roomName = _[0];
    }

    @when(true)
    repair(s: MachineState, m: RepairViaTowerProcess) {
        if(!this.memory.roomName){
            console.log('RepairViaTowerProcess - memory.roomName is no set.')
            m.exit();
            return;
        }
        const currentRoom = Game.rooms[this.memory.roomName];
        const towers: StructureTower[] | null = currentRoom.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && (s.store.getUsedCapacity(RESOURCE_ENERGY)) > (s.store.getCapacity(RESOURCE_ENERGY) / 2) });
        if (!towers || towers.length === 0) {
            this.kernel.killProcess(this.pid);
            m.exit();
            return;
        }

        let structures = currentRoom.find(FIND_STRUCTURES, { filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL) });
        if (!structures || structures.length === 0) {
            this.kernel.killProcess(this.pid);
            m.exit();
            return;
        }

        let targetStructure = _.sortBy(structures, s => s.hits / s.hitsMax)[0];

        if (!targetStructure) {
            this.kernel.killProcess(this.pid);
            m.exit();
            return;
        }

        towers.forEach(t => t.repair(targetStructure));
        this.kernel.killProcess(this.pid);
        m.exit();
    }
}
