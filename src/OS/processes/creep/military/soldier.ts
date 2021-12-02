import { StateMachine, when } from "when-ts";
import "libs/Traveler/Traveler";
import { Process } from "OS/kernel/process";
import { ProcessStatus } from "OS/kernel/process-status";

export class SolderProcess extends Process<CreepState> {

    @when<CreepState>(c => !c.creep)
    noCreepDefined(s: CreepState, m: SolderProcess) {
        const creep = Game.getObjectById<Creep>(this.memory.creepId);
        if(creep){
            s.creep = creep;
            return s;
        }else{
            this.status = ProcessStatus.DEAD;
            m.exit();
        }

        return;
    }

    @when(s => Game.flags.attackFlag && s.creep.room !== Game.flags.attackFlag.room)
    moveTowardsFlag(s: CreepState, m: SolderProcess) {
        s.creep.travelTo(Game.flags.attackFlag);

        m.exit();
    }

    @when(s => Game.flags.attackFlag && s.creep.room === Game.flags.attackFlag.room)
    attack(s: CreepState, m: SolderProcess) {
        var hostiles = s.creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            let targetEnemy = s.creep.pos.findClosestByPath(hostiles);
            if (!targetEnemy)
                return;

            s.creep.memory.targetEnemyId = targetEnemy.id;

            if (s.creep.attack(targetEnemy) == ERR_NOT_IN_RANGE) {
                s.creep.travelTo(targetEnemy);
            }
        }
        else {
            //const hostileBuildings = s.creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_INVADER_CORE});
            const hostileBuildings = s.creep.room.find(FIND_HOSTILE_STRUCTURES);
            if (hostileBuildings.length > 0) {
                const targetBuilding = s.creep.pos.findClosestByPath(hostileBuildings);
                if (!targetBuilding)
                    return;

                s.creep.memory.targetEnemyId = targetBuilding.id;

                if (s.creep.attack(targetBuilding) == ERR_NOT_IN_RANGE) {
                    s.creep.travelTo(targetBuilding);
                }
            } else {
                const walls = s.creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL && s.hits === 1 });
                if (walls.length > 0) {
                    const wall = s.creep.pos.findClosestByPath(walls);
                    if (!wall)
                        return;

                    s.creep.memory.targetEnemyId = wall.id;

                    if (s.creep.attack(wall) == ERR_NOT_IN_RANGE) {
                        s.creep.travelTo(wall);
                    }
                }
            }
        }
        m.exit();
    }
}
