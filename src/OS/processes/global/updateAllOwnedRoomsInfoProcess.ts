import { GlobalMemory } from "GlobalMemory";
import { profile } from "libs/Profiler-ts/Profiler";
import { ProcessPriority } from "OS/kernel/constants";
import { Process } from "OS/kernel/process";
import { UpdateOwnedRoomInfo } from "./updateOwnedRoomInfo";

@profile
export class UpdateAllOwnedRoomsInfoProcess extends Process {
    public classPath(): string {
        return "UpdateAllOwnedRoomsInfoProcess";
    }

    public run(): number {
        console.log('Running UpdateAllOwnedRoomsInfoProcess');
        GlobalMemory.RoomInfo = GlobalMemory.RoomInfo || {};

        _.forEach(Game.rooms, (room) => {
            if (room.controller && room.controller.my) {
                GlobalMemory.RoomInfo[room.name] = GlobalMemory.RoomInfo[room.name] || {};
                let p = new UpdateOwnedRoomInfo(0, this.pid);
                p = this.kernel.addProcess(p, ProcessPriority.LowPriority);
                p.setup(room.name);
            }
        });


        console.log('Sleeping UpdateAllOwnedRoomsInfoProcess');
        this.kernel.sleepProcessByTime(this, 200);
        //this.kernel.killProcess(this.pid);

        return 0;
    }
}
