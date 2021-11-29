import { RoleHarvester } from "./harvester";
import { StateMachine, when } from 'when-ts';
import "libs/Traveler/Traveler";

export class RolePillager extends StateMachine<CreepState> {
    constructor(creep: Creep) {
        super({ creep: creep});
    }

    @when<CreepState>(c => c.creep.memory.working && c.creep.store.getFreeCapacity() === 0)
    finishedWorking(s: CreepState, m: RolePillager) {
        s.creep.memory.working = false;
        s.creep.say('delivering');
    }

    @when<CreepState>(c => !c.creep.memory.working && c.creep.store.getUsedCapacity() === 0)
    startedWorking(s: CreepState, m: RolePillager) {
        s.creep.memory.working = true;
        s.creep.say('pillaging');
    }

    @when<CreepState>(c => c.creep.memory.working )
    working(s: CreepState, m: RolePillager) {
        if (s.creep.room !== Game.flags.pillageFlag.room) {
            s.creep.travelTo(Game.flags.pillageFlag);
        }
        else {
            RoleHarvester.run(s.creep);
        }

        m.exit();
        return { creep: s.creep, ranToCompletion: true };
    }

    @when<CreepState>(c => !c.creep.memory.working)
    delivering(s: CreepState, m: RolePillager) {
        if (s.creep.room === Game.flags.pillageFlag.room) {
            if (Game.flags.depositFlag) {
                s.creep.travelTo(Game.flags.depositFlag);
            }
        }
        else {
            RoleHarvester.run(s.creep);
        }

        m.exit();
        return { creep: s.creep, ranToCompletion: true };
    }

    // @when<State>(state => state.value >= 5)
    // exitWhenDone(s: State, m: RolePillager) {
    //     console.log(`finished on tick #${m.history.tick}, exiting`, s);
    //     m.exit(); // exit the state machine
    // }

    // public static run(creep: Creep) {
    //     if (creep.memory.working && creep.store.getFreeCapacity() === 0) {
    //         creep.memory.working = false;
    //         creep.say('delivering');
    //     }

    //     if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
    //         creep.memory.working = true;
    //         creep.say('pillaging');
    //     }

    //     if (creep.memory.working) {
    //         if (creep.room !== Game.flags.pillageFlag.room) {
    //             creep.travelTo(Game.flags.pillageFlag);
    //         }
    //         else {
    //             RoleHarvester.run(creep);
    //         }
    //     }
    //     else {
    //         if (creep.room === Game.flags.pillageFlag.room) {
    //             if (Game.flags.depositFlag) {
    //                 creep.travelTo(Game.flags.depositFlag);
    //             }
    //         }
    //         else {
    //             RoleHarvester.run(creep);
    //         }
    //     }
    // }
}
