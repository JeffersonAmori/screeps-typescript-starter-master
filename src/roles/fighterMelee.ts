import { filter } from "lodash";
import { moveMessagePortToContext } from "worker_threads";

export class FighterMelee {
    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            let targetEnemy = creep.pos.findClosestByPath(hostiles);
            if (!targetEnemy)
                return;

            creep.memory.targetEnemyId = targetEnemy.id;

            if (creep.attack(targetEnemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetEnemy);
            }
        }
        else {
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
        }
    }
};
