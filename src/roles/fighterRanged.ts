export class FighterRanged {
    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        var hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            let closestEnemy = creep.pos.findClosestByPath(hostiles);
            if (!closestEnemy)
                return;

            if (creep.attack(closestEnemy) == ERR_NOT_IN_RANGE) {
                creep.moveTo(closestEnemy);
            }
        }
    }
};
