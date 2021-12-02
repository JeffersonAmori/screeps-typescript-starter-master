import { RoleUpgrader } from "roles/upgrader";
import { RoleCommon } from "roles/_common";
import { MachineState, when } from "when-ts";
import { Process } from "../kernel/process";
import { ProcessStatus } from "../kernel/process-status";

enum UpgradeProcessStates{
    initial,
    upgrading,
    gettingEnergy
}

export class UpgradeProcess extends Process<MachineState> {
    public classPath(): string {
        return "UpgradeProcess";
    }

    // public run(): number {
    //     if (!this.memory.creepId) {
    //         this.status = ProcessStatus.DEAD;
    //         return -1;
    //     }

    //     const creep: Creep | null = Game.getObjectById<Creep>(this.memory.creepId);

    //     if (!creep) {
    //         this.status = ProcessStatus.DEAD;
    //         return -1;
    //     }

    //     console.log(`Running upgraders via process! | ${this.pid} | ${creep.name}`)

    //     new RoleUpgrader(creep).run();
    //     return 0;
    // }

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


    // @when<CreepProcessState>(s => s.state !== UpgradeProcessStates.upgrading && s.state !== UpgradeProcessStates.gettingEnergy)
    // stateChange(s: CreepProcessState, m: UpgradeProcess){
    //     console.log(`stateChange | ${JSON.stringify(s)}`)
    //     if(!s.creep)
    //         s.creep = Game.getObjectById<Creep>(this.memory.creepId)!;

    //     if(s.creep.memory.working && s.creep.store.getUsedCapacity() === 0){
    //         this.memory.state = UpgradeProcessStates.gettingEnergy;
    //         s.state = UpgradeProcessStates.gettingEnergy
    //         s.creep.say('harvesting');
    //     }

    //     if(!s.creep.memory.working && s.creep.store.getUsedCapacity() === s.creep.store.getCapacity()){
    //         this.memory.state = UpgradeProcessStates.upgrading;
    //         s.state = UpgradeProcessStates.upgrading;
    //         s.creep.say('upgrading');
    //     }

    //     return s;
    // }

    // @when<CreepProcessState>(s => s.state === UpgradeProcessStates.upgrading)
    // upgrade(s: CreepProcessState, m: UpgradeProcess) {
    //     console.log(`upgrade | ${JSON.stringify(s)}`)
    //     const controller = s.creep.room.controller;
    //     if (!controller)
    //         return;

    //     if (s.creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
    //         s.creep.travelTo(controller);
    //     }

    //     m.exit();
    //     return s;
    // }

    // @when<CreepProcessState>(s => s.state === UpgradeProcessStates.gettingEnergy)
    // getEnergy(s: CreepProcessState, m: UpgradeProcess) {
    //     console.log(`getEnergy | ${JSON.stringify(s)}`)
    //     RoleCommon.getEnergy(s.creep);

    //     m.exit();
    //     return s;
    // }






    // /** @param {Creep} creep **/
    // public static run(creep: Creep): void {
    //     if (creep.memory.working && creep.carry.energy == 0) {
    //         creep.memory.working = false;
    //         creep.say('harvesting');
    //     }
    //     else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
    //         creep.memory.working = true;
    //         creep.say('upgrading');
    //     }

    //     if (creep.memory.working) {
    //         const controller = creep.room.controller;
    //         if (!controller)
    //             return;

    //         if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
    //             creep.travelTo(controller);
    //         }
    //     }
    //     else {
    //         RoleCommon.getEnergy(creep);
    //     }
    // }
}
