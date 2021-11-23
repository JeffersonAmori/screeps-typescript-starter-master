import { RoleCommon } from "./_common";

export class RoleUpgrader {

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
                creep.moveTo(controller);
            }
        }
        else {
            RoleCommon.getEnergy(creep);
        }
    }
};
