import { CreepFactory } from "creepFactory";
import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";

export class SpawnCreepProcess extends Process {

    public classPath(): string {
        return 'SpawnCreepProcess';
    }

    // _[0] - roomName
    setup(..._: any) {
        this.memory.roomName = _[0];
        return this;
    }

    public run(): number {
        console.log('SpawnCreepProcess run ' + this.memory.roomName);
        if (!this.memory.roomName) {
            console.log('SpawnCreepProcess - memory.roomName is no set.')
            return -1;
        }
        if (!GlobalMemory.RoomInfo[this.memory.roomName].spawnCreepQueue)
            return -1;

        const nextCreep = this.memory.nextCreep || GlobalMemory.RoomInfo[this.memory.roomName].spawnCreepQueue!.pop()
        if (nextCreep) {

            console.log('SpawnCreepProcess breeding ' + nextCreep + ' on room ' + this.memory.roomName);
            const creepFactory: CreepFactory = new CreepFactory(Game.rooms[this.memory.roomName]);
            if (creepFactory.CreateCreep(nextCreep) === OK) {
                delete this.memory.nextCreep;
            } else {
                this.memory.nextCreep = nextCreep;
            }
        }

        return 0;
    }


}
