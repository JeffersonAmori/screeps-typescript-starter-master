import "libs/Traveler/Traveler";

export class FighterRanged {
    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            let closestEnemy = creep.pos.findClosestByPath(hostiles);
            if (!closestEnemy)
                return;

            console.log('found closes enemy ' + closestEnemy.name)

            if (creep.rangedAttack(closestEnemy) == ERR_NOT_IN_RANGE) {
                console.log('moving closer... ' + closestEnemy.name)
                creep.travelTo(closestEnemy);
            }
            else {
                if (creep.pos.inRangeTo(closestEnemy.pos.x, closestEnemy.pos.y, 3)) {
                    const fleePath = PathFinder.search(creep.pos, { pos: creep.pos, range: 3 }, { flee: true });
                    console.log('flee path: ' + JSON.stringify(fleePath));
                    console.log(creep.moveByPath(fleePath.path));
                }
            }
        }
        else{
            if(creep.hits < creep.hitsMax){
                creep.heal(creep);
            }
        }
    }
};
