import "libs/Traveler/Traveler";
import { Process } from "OS/kernel/process";
import { RoleBuilder } from "roles/builder";

export class PioneerProcess extends Process {
    private _creep: Creep | null = null;
    public classPath(): string {
        return "PioneerProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
    }

    public run(): number {
        this._creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (!this._creep) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        let targetSpawnRoom : StructureSpawn | Flag = Game.flags.colonizeFlag || _.sortBy(Game.spawns, s => s.room.controller?.level)[0];
        if (this._creep.room != targetSpawnRoom.room)
        this._creep.travelTo(targetSpawnRoom);
        else {
            RoleBuilder.run(this._creep)
        }

        return 0;
    }
}
