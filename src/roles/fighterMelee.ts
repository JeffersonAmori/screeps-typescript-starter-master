import { filter } from "lodash";
import { moveMessagePortToContext } from "worker_threads";

export class FighterMelee {
    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        console.log(creep.memory.targetEnemyId);
        if (hostiles.length > 0) {
            let targetEnemy = creep.pos.findClosestByPath(hostiles);
            if (!targetEnemy)
                return;

            creep.memory.targetEnemyId = targetEnemy.id;

            if (creep.attack(targetEnemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targetEnemy);
            }
        } else {
            if (creep.memory.targetEnemyId) {
                let targetEnemy = Game.getObjectById<Creep>(creep.memory.targetEnemyId);

                console.log(targetEnemy);
                console.log(targetEnemy?.name);

                if (targetEnemy) {
                    if (creep.attack(targetEnemy) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targetEnemy);
                    }
                } else {
                    creep.moveTo(Game.flags.Flag1);
                    // let spawn: StructureSpawn | null = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    //     filter: s => s.structureType === STRUCTURE_SPAWN
                    // });

                    // if (spawn) {
                    //     creep.moveTo(spawn);
                    // }
                }
            }
        }
    }
};
