import { RoleUpgrader } from "./upgrader";
import { RoleCommon } from "./_common";
import "libs/Traveler/Traveler";

export class RoleBuilder extends RoleCommon {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {

        if (creep.memory.working && creep.store.getUsedCapacity() === 0) {
            creep.memory.working = false;
            delete creep.memory.targetConstructionSiteId;
            creep.say('harvesting');
        }

        if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
            creep.memory.working = true;
            creep.say('building');
        }

        if (creep.memory.working) {
            if (!creep.memory.targetConstructionSiteId) {
                const constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (constructionSite) {
                    creep.memory.targetConstructionSiteId = constructionSite.id;
                } else {
                    delete creep.memory.targetConstructionSiteId;
                }
            }
            if (creep.memory.targetConstructionSiteId) {
                let target = Game.getObjectById<ConstructionSite>(creep.memory.targetConstructionSiteId);
                if (target) {
                    if (creep.build(target) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target);
                    }
                }
                else{
                    delete creep.memory.targetConstructionSiteId;
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
