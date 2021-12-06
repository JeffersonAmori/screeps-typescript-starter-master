import { Consts } from "consts";
import { filter, initial } from "lodash";
import { Defcon } from "military/defcon";
import { Mother as MotherProcess } from "meta/Mother";
import { Sheriff } from "./Sheriff";
import { RepairViaTowerProcess } from "OS/processes/tower/repairViaTower";
import * as kernel from "OS/kernel/kernel"
import { profile } from "libs/Profiler-ts";
import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";


@profile
export class MayorProcess extends Process {
    private _room: Room | null = null;

    // _[0] - roomId
    public setup(..._: any) {
        this.memory.roomName = _[0];
    }

    public run(): number {
        this._room = Game.rooms[this.memory.roomName];
        if (!this._room) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        checkForHostiles(this._room);

        this.breedTownsfolk();
        //this.repairUsingTower();

        return 0;
    }

    private repairUsingTower() {
        if (!this._room)
            return;

        const controller = this._room.controller;
        if (controller && controller.my) {
            if (!GlobalMemory.RoomInfo[this._room.name].towerRepairProcessId) {
                const towerRepairProcess = kernel.addProcess(new RepairViaTowerProcess(0, this.pid));
                towerRepairProcess.setup(this._room.name);
                GlobalMemory.RoomInfo[this._room.name].towerRepairProcessId = towerRepairProcess.pid;
            }
        }
    }

    private breedTownsfolk() {
        if (!this._room)
            return;

        if (!GlobalMemory.RoomInfo[this._room.name].motherProcessId) {
            const motherProcess = kernel.addProcess(new MotherProcess(0, this.pid));
            motherProcess.setup(this._room.name);
            GlobalMemory.RoomInfo[this._room.name].motherProcessId = motherProcess.pid;
        }
    }
}

function checkForHostiles(room: Room) {
    var hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        const sheriff = new Sheriff(room);
        Defcon.run(room);
    }
}
