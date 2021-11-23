import { RoleUpgrader } from "./upgrader";
import { RoleCommon } from "./_common";

export class RoleBuilder {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {

        if (creep.memory.working && creep.carry.energy == 0) {
            creep.memory.working = false;
            creep.say('harvesting');
        }

        if (!creep.memory.working && creep.carry.energy == creep.carryCapacity) {
            creep.memory.working = true;
            creep.say('building');
        }

        if (creep.memory.working) {
            let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
            if (target) {
                if (creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            else {
                RoleUpgrader.run(creep);
            }
        }
        else {
            RoleCommon.getEnergy(creep);
        }
    }
}
