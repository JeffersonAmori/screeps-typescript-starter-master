import "libs/Traveler/Traveler";
import { Process } from "OS/kernel/process";

export class SoldierProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "SoldierProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
        return this;
    }

    public run(): number {
        this._creep = Game.getObjectById<Creep>(this.memory.creepId);
        if (!this._creep) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        if (Game.flags.attackFlag && this._creep.room !== Game.flags.attackFlag.room)
            this.moveTowardsFlag();
        else if (Game.flags.attackFlag && this._creep.room === Game.flags.attackFlag.room) {
            this.attack();
        }

        return 0;
    }


    moveTowardsFlag() {
        if (!this._creep)
            return;
        this._creep.travelTo(Game.flags.attackFlag);
    }

    attack() {
        if (!this._creep)
            return;

        var hostiles = this._creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            let targetEnemy = this._creep.pos.findClosestByPath(hostiles);
            if (!targetEnemy)
                return;

            this._creep.memory.targetEnemyId = targetEnemy.id;

            if (this._creep.attack(targetEnemy) == ERR_NOT_IN_RANGE) {
                this._creep.travelTo(targetEnemy);
            }
        }
        else {
            //const hostileBuildings = this._creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_INVADER_CORE});
            const hostileBuildings = this._creep.room.find(FIND_HOSTILE_STRUCTURES);
            if (hostileBuildings.length > 0) {
                const targetBuilding = this._creep.pos.findClosestByPath(hostileBuildings);
                if (!targetBuilding)
                    return;

                this._creep.memory.targetEnemyId = targetBuilding.id;

                if (this._creep.attack(targetBuilding) == ERR_NOT_IN_RANGE) {
                    this._creep.travelTo(targetBuilding);
                }
            } else {
                const walls = this._creep.room.find(FIND_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_WALL && s.hits === 1 });
                if (walls.length > 0) {
                    const wall = this._creep.pos.findClosestByPath(walls);
                    if (!wall)
                        return;

                    this._creep.memory.targetEnemyId = wall.id;

                    if (this._creep.attack(wall) == ERR_NOT_IN_RANGE) {
                        this._creep.travelTo(wall);
                    }
                }
            }
        }

        return;
    }
}
