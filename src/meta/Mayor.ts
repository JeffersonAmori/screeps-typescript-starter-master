import { Defcon } from "military/defcon";
import { MotherProcess } from "meta/Mother";
import { SheriffProcess } from "./Sheriff";
import { RepairViaTowerProcess } from "OS/processes/tower/repairViaTower";
import { profile } from "libs/Profiler-ts";
import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";
import * as kernel from "OS/kernel/kernel"


@profile
export class MayorProcess extends Process {
    private _room: Room | null = null;

    public classPath() {
        return 'MayorProcess';
    }

    // _[0] - roomName
    public setup(..._: any) {
        this.memory.roomName = _[0];
    }

    public run(): number {
        this._room = Game.rooms[this.memory.roomName];
        console.log('Mayor run ' + this._room.name);
        if (!this._room) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        this.breedTownsfolk();
        this.checkForHostiles();

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

        if (!GlobalMemory.RoomInfo[this._room.name].motherProcessId || !this.kernel.getProcessById(GlobalMemory.RoomInfo[this._room.name].motherProcessId!)) {
            const motherProcess = kernel.addProcess(new MotherProcess(0, this.pid));
            motherProcess.setup(this._room.name);
            GlobalMemory.RoomInfo[this._room.name].motherProcessId = motherProcess.pid;
        }
    }

    private checkForHostiles() {
        if (!this._room)
            return;

        var hostiles = this._room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {

            if (!GlobalMemory.RoomInfo[this._room.name].sheriffProcessId || !this.kernel.getProcessById(GlobalMemory.RoomInfo[this._room.name].sheriffProcessId!)) {
                const sheriffProcess = this.kernel.addProcess(new SheriffProcess(0, this.parentPID));
                sheriffProcess.setup(this.memory.roomName);
                GlobalMemory.RoomInfo[this._room.name].sheriffProcessId = sheriffProcess.pid;
            }
        }
    }
}
