import { Process } from "OS/kernel/process";
import { generateRoomPlans } from "./RoomArchitect";

export class PlanRunProcess extends Process {
    public classPath(): string {
        return 'PlanRunProcess';
    }
    public run(): number {
        console.log('PlanRunProcess run!')
        let start = Game.cpu.getUsed();
        if (Game.cpu.bucket < 500) return -1; // Don't do room planning at low bucket levels

        Memory.roomPlans ??= {};

        for (let room in Memory.rooms) {
            console.log(room);

        console.log('Plan complete?' + Memory.roomPlans[room]?.complete)
            if (Memory.roomPlans[room]?.complete) continue; // Already planned
            if (!Memory.rooms[room].controllerId) continue; // No controller or room hasn't been properly scanned yet
            if (Game.cpu.getUsed() - start <= 5) {
                generateRoomPlans(room);
            }
            Game.rooms[room].visual.circle
        }

        return 0;
    }

    public setup(..._: any[]): Process {
        return this;
    }

}
