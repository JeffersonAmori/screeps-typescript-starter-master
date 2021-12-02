import { RoleCommon } from "roles/_common";
import { when } from "when-ts";
import { Process } from "../kernel/process";
import { ProcessStatus } from "../kernel/process-status";

enum UpgradeProcessStates{
    initial,
    upgrading,
    gettingEnergy
}

export class UpgradeProcess extends Process<CreepState> {
    public classPath(): string {
        return "UpgradeProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        console.log(`setup`)

        this.memory.creepId = _[0];
        this.setInitialState({creep: Game.getObjectById<Creep>(this.memory.creepId)!})
    }

    @when<CreepState>(c => !c.creep)
    noMoreCreep(s: CreepState, m: UpgradeProcess){
        this.status = ProcessStatus.DEAD;

        m.exit();
    }

    @when<CreepState>(c => c.creep.memory.working && c.creep.store.getUsedCapacity() === 0)
    finishedWorking(s: CreepState, m: UpgradeProcess) {
        console.log(`${s.creep.name} finishedWorking`);
        s.creep.memory.working = false;
        s.creep.say('harvesting');
    }

    @when<CreepState>(c => !c.creep.memory.working && c.creep.store.getUsedCapacity() === c.creep.store.getCapacity())
    startedWorking(s: CreepState, m: UpgradeProcess) {
        console.log(`${s.creep.name} startedWorking`);
        s.creep.memory.working = true;
        s.creep.say('upgrading');
    }

    @when<CreepState>(s => s.creep.memory.working)
    upgrade(s: CreepState, m: UpgradeProcess) {
        console.log(`${s.creep.name} upgrade`);
        const controller = s.creep.room.controller;
        if (!controller)
            return;

        if (s.creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            s.creep.travelTo(controller);
        }

        m.exit();
    }

    @when<CreepState>(s => !s.creep.memory.working)
    getEnergy(s: CreepState, m: UpgradeProcess) {
        console.log(`${s.creep.name} getEnergy`);
        RoleCommon.getEnergy(s.creep);

        m.exit();
    }
}
