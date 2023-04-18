import "libs/Traveler/Traveler";
import { Process } from "OS/kernel/process";
import { BuilderProcess } from "../townsfolk/builder";
import * as _ from 'lodash';

export class PioneerProcess extends Process {
    private _creep: Creep | null = null;
    public classPath(): string {
        return "PioneerProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        return this;
    }

    public run(): number {
        this._creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (!this._creep) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        let targetSpawnRoom: StructureSpawn | Flag = Game.flags.colonizeFlag || _.sortBy(Game.spawns, s => s.room.controller?.level)[0];
        if (this._creep.room != targetSpawnRoom.room)
            this._creep.travelTo(targetSpawnRoom);
        else {
            this.kernel.forkProcess(this, new BuilderProcess(0, this.pid))
                .setup(this.memory.creepId);
        }

        return 0;
    }
}
