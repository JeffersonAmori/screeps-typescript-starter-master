import { RoleHarvester } from "./harvester";
import { StateMachine, when } from 'when-ts';
import "libs/Traveler/Traveler";

export class RolePillager extends StateMachine<CreepState> {
    private _creep: Creep;

    constructor(creep: Creep) {
        super({ creep: creep, ranToCompletion: false });
        this._creep = creep;
    }

    @when<CreepState>(c => c.creep.memory.working && c.creep.store.getFreeCapacity() === 0)
    finishedWorking(s: CreepState, m: RolePillager) {
        this._creep.memory.working = false;
        this._creep.say('delivering');
    }

    @when<CreepState>(c => c.creep.memory.working && c.creep.store.getUsedCapacity() === 0)
    startedWorking(s: CreepState, m: RolePillager) {
        this._creep.memory.working = true;
        this._creep.say('pillaging');
    }

    @when<CreepState>(c => c.creep.memory.working && !c.ranToCompletion)
    working(s: CreepState, m: RolePillager) {
        console.log('Working ' + this._creep.name);
        if (this._creep.room !== Game.flags.pillageFlag.room) {
            this._creep.travelTo(Game.flags.pillageFlag);
        }
        else {
            RoleHarvester.run(this._creep);
        }

        return { creep: s.creep, ranToCompletion: true };
    }

    @when<CreepState>(c => !c.creep.memory.working && !c.ranToCompletion)
    delivering(s: CreepState, m: RolePillager) {
        console.log('Delivering ' + this._creep.name);
        if (this._creep.room === Game.flags.pillageFlag.room) {
            if (Game.flags.depositFlag) {
                this._creep.travelTo(Game.flags.depositFlag);
            }
        }
        else {
            RoleHarvester.run(this._creep);
        }

        return { creep: s.creep, ranToCompletion: true };
    }

    @when<CreepState>(c => c.ranToCompletion)
    finish(s: CreepState, m: RolePillager) {
        console.log('Finishing ' + this._creep.name);
        m.exit(s);
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
