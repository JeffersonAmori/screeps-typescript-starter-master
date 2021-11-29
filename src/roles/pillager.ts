import { RoleHarvester } from "./harvester";
import "libs/Traveler/Traveler";

export class RolePillager {
    public static run(creep: Creep) {
        if (creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = false;
            creep.say('delivering');
        }

        if (!creep.memory.working && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = true;
            creep.say('pillaging');
        }

        if (creep.memory.working) {
            if (creep.room !== Game.flags.pillageFlag.room) {
                creep.travelTo(Game.flags.pillageFlag);
            }
            else {
                RoleHarvester.run(creep);
            }
        }
        else {
            if (creep.room === Game.flags.pillageFlag.room) {
                if (Game.flags.depositFlag) {
                    creep.travelTo(Game.flags.depositFlag);
                }
            }
            else {
                RoleHarvester.run(creep);
            }
        }
    }
}
