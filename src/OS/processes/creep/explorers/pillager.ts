import { RoleHarvester } from "roles/harvester";
import { when } from "when-ts";
import { Process } from "../../../kernel/process";
import { ProcessStatus } from "../../../kernel/process-status";


export class PillagerProcess extends Process<CreepState> {
    public classPath(): string {
        return "PillagerProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        this.setInitialState({ creep: Game.getObjectById<Creep>(this.memory.creepId)! })
    }

    @when<CreepState>(c => !c.creep)
    noCreepDefined(s: CreepState, m: PillagerProcess) {
        const creep = Game.getObjectById<Creep>(this.memory.creepId);
        if(creep){
            s.creep = creep;
            return s;
        }else{
            this.kernel.killProcess(this.pid);
            m.exit();
        }

        return;
    }

    @when<CreepState>(c => c.creep.memory.working && c.creep.store.getFreeCapacity() === 0)
    finishedWorking(s: CreepState, m: PillagerProcess) {
        s.creep.memory.working = false;
        s.creep.say('delivering');
    }

    @when<CreepState>(c => !c.creep.memory.working && c.creep.store.getUsedCapacity() === 0)
    startedWorking(s: CreepState, m: PillagerProcess) {
        s.creep.memory.working = true;
        s.creep.say('pillaging');
    }

    @when<CreepState>(c => c.creep.memory.working)
    working(s: CreepState, m: PillagerProcess) {
        if (s.creep.room !== Game.flags.pillageFlag.room) {
            s.creep.travelTo(Game.flags.pillageFlag);
        }
        else {
            RoleHarvester.run(s.creep);
        }

        m.exit();
        return { creep: s.creep };
    }

    @when<CreepState>(c => !c.creep.memory.working)
    delivering(s: CreepState, m: PillagerProcess) {
        if (s.creep.room === Game.flags.pillageFlag.room) {
            if (Game.flags.depositFlag) {
                s.creep.travelTo(Game.flags.depositFlag);
            }
        }
        else {
            RoleHarvester.run(s.creep);
        }

        m.exit();
        return { creep: s.creep };
    }
}
