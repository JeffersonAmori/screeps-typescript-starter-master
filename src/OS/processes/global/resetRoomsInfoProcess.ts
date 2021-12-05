// import { Process } from "OS/kernel/process";
// import { RoomInfo } from "roomInfo";
// import { MachineState, when } from "when-ts";

// export class resetRoomsInfoProcess extends Process<MachineState>{

//     @when<MachineState>(true)
//     resetRoomInfo(s: MachineState, m: resetRoomsInfoProcess){
//         let roomInfo: RoomInfo = {}
//         _.forEach(Game.rooms, room => roomInfo[room.name] = {})
//         Memory.RoomsInfo = JSON.stringify(roomInfo);
//         Memory.Started = true;

//         this.kernel.killProcess(this.pid);
//         m.exit();
//     }
// }
