import { GlobalMemory } from "GlobalMemory";
import { ProcessPriority } from "OS/kernel/constants";
import { Process } from "OS/kernel/process";
import { MachineState, when } from "when-ts";
import { UpdateOwnedRoomInfo } from "./updateOwnedRoomInfo";

export class UpdateAllOwnedRoomsInfoProcess extends Process<MachineState>{
    public classPath(): string {
        return "UpdateAllOwnedRoomsInfoProcess";
    }

    // _[0] - roomName
    public setup(..._: any[]) {
        this.memory.roomName = _[0];
    }

    @when<MachineState>(true)
    updateAllOwnedRoomsInfo(s: MachineState, m: UpdateAllOwnedRoomsInfoProcess) {
        console.log('updateAllOwnedRoomsInfo');
        GlobalMemory.RoomInfo = GlobalMemory.RoomInfo || {};

        _.forEach(Game.rooms, (room) => {
            let p = new UpdateOwnedRoomInfo(0, 0)
            p = this.kernel.addProcess(p, ProcessPriority.LowPriority);
            p.setup(room.name)
        });

        // this.kernel.killProcess(this.pid);
         this.kernel.sleepProcess(this, 10);
        m.exit();
    }
}
