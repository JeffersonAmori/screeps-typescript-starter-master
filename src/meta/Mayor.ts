import { MotherProcess } from "meta/Mother";
import { SheriffProcess } from "./Sheriff";
import { RepairViaTowerProcess } from "OS/processes/tower/repairViaTower";
import { profile } from "libs/Profiler-ts";
import { GlobalMemory } from "GlobalMemory";
import { Process } from "OS/kernel/process";
import * as kernel from "OS/kernel/kernel"
import { RoomData } from "roomInfo";


@profile
export class MayorProcess extends Process {
    private _room?: Room;
    private _roomInfo?: RoomData;

    public classPath() {
        return 'MayorProcess';
    }

    // _[0] - roomName
    public setup(..._: any) {
        this.memory.roomName = _[0];
        return this;
    }

    public run(): number {
        if (!this.memory) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        this._room = Game.rooms[this.memory.roomName];
        if (!this._room) {
            this.kernel.killProcess(this.pid);
            return -1;
        }
        console.log('Mayor run ' + this._room.name);

        if (!this._room) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        const towers = Game.rooms[this.memory.roomName].find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER });

        this._roomInfo = GlobalMemory.RoomInfo[this._room.name];
        this._roomInfo.processes = this._roomInfo.processes || {};
        this._roomInfo.spawnCreepQueue = this._roomInfo.spawnCreepQueue || [];

        this.checkForHostiles();
        this.breedTownsfolk();

        if (towers && towers.length > 0)
            this.repairUsingTower();

        return 0;
    }

    private repairUsingTower() {
        if (!this._room || !this._roomInfo)
            return;

        if (!this.processAlreadyRunningOnThisRoom(RepairViaTowerProcess.name)) {
            const towerRepairProcess = kernel.addProcess(new RepairViaTowerProcess(0, this.pid)).setup(this._room.name);
            this._roomInfo.processes[RepairViaTowerProcess.name] = towerRepairProcess.pid;
        }
    }

    private breedTownsfolk() {
        if (!this._room || !this._roomInfo)
            return;

        if (!this.processAlreadyRunningOnThisRoom(MotherProcess.name)) {
            const motherProcess = kernel.addProcess(new MotherProcess(0, this.pid)).setup(this._room.name);
            this._roomInfo.processes[MotherProcess.name] = motherProcess.pid;
        }
    }

    private processAlreadyRunningOnThisRoom(processType: string): boolean {
        if (!this._room || !this._roomInfo)
            return false;

        return !!this._roomInfo.processes[processType] && !!this.kernel.getProcessById(this._roomInfo.processes[processType]);
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
