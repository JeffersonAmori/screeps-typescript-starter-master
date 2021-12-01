import { RoleUpgrader } from "roles/upgrader";
import { RoleCommon } from "roles/_common";
import { when } from "when-ts";
import { Process } from "../kernel/process";
import { ProcessStatus } from "../kernel/process-status";

export class UpgradeProcess extends Process {
    public classPath(): string {
        return "UpgradeProcess";
    }

    public run(): number {
        if (!this.memory.creepId) {
            this.status = ProcessStatus.DEAD;
            return -1;
        }

        const creep: Creep | null = Game.getObjectById<Creep>(this.memory.creepId);


        if (!creep) {
            this.status = ProcessStatus.DEAD;
            return -1;
        }

        console.log(`Running upgraders via process! | ${this.pid} | ${creep.name}`)

        new RoleUpgrader(creep).run();
        return 0;
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
    }

    @when<CreepState>(true)
    stateChange(s: CreepState, m: RoleUpgrader){

    }



    @when<CreepState>(c => c.creep.memory.working && c.creep.store.getUsedCapacity() === 0)
    finishedWorking(s: CreepState, m: RoleUpgrader) {
        s.creep.memory.working = false;
        s.creep.say('harvesting');
    }

    @when<CreepState>(c => !c.creep.memory.working && c.creep.store.getUsedCapacity() === c.creep.store.getCapacity())
    startedWorking(s: CreepState, m: RoleUpgrader) {
        s.creep.memory.working = true;
        s.creep.say('upgrading');
    }

    @when<CreepState>(s => s.creep.memory.working)
    upgrade(s: CreepState, m: RoleUpgrader) {
        const controller = s.creep.room.controller;
        if (!controller)
            return;

        if (s.creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            s.creep.travelTo(controller);
        }

        m.exit();
    }

    @when<CreepState>(s => !s.creep.memory.working)
    getEnergy(s: CreepState, m: RoleUpgrader) {
        RoleCommon.getEnergy(s.creep);

        m.exit();
    }

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvesting');
        }
        else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('upgrading');
        }

        if (creep.memory.working) {
            const controller = creep.room.controller;
            if (!controller)
                return;

            if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                creep.travelTo(controller);
            }
        }
        else {
            RoleCommon.getEnergy(creep);
        }
    }
}
