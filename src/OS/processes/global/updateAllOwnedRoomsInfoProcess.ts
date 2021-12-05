import { GlobalMemory } from "GlobalMemory";
import { ProcessPriority } from "OS/kernel/constants";
import { Process } from "OS/kernel/process";
import { MachineState, when } from "when-ts";
import { UpdateOwnedRoomInfo } from "./updateOwnedRoomInfo";

export class UpdateAllOwnedRoomsInfoProcess extends Process{
    public classPath(): string {
        return "UpdateAllOwnedRoomsInfoProcess";
    }

    // _[0] - roomName
    public setup(..._: any[]) {
        this.memory.roomName = _[0];
    }

    public run():number {
        GlobalMemory.RoomInfo = GlobalMemory.RoomInfo || {};

        _.forEach(Game.rooms, (room) => {
            GlobalMemory.RoomInfo[room.name] = GlobalMemory.RoomInfo[room.name] || {};
            let p = new UpdateOwnedRoomInfo(0, this.pid);
            p = this.kernel.addProcess(p, ProcessPriority.LowPriority);
            p.setup(room.name);
        });

        this.kernel.sleepProcessByTime(this, 200);

        return 0;
    }
}
