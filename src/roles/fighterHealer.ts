import "libs/Traveler/Traveler";

export class FighterHealer {
    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        let damagedFriends = _.filter(creep.room.find(FIND_MY_CREEPS), c => c.hits < c.hitsMax);
        if (!damagedFriends)
            return;

        if (damagedFriends.length > 0) {
            let pathToClosestDamagedFriend: PathFinderPath | null = null;
            let closestDamagedFriend: Creep | null = null;
            for (let friend in damagedFriends) {
                let path: PathFinderPath = PathFinder.search(creep.pos, Game.creeps[friend].pos);
                if (!pathToClosestDamagedFriend || pathToClosestDamagedFriend.cost < path.cost) {
                    pathToClosestDamagedFriend = path;
                    closestDamagedFriend = Game.creeps[friend];
                }
            }

            if (!closestDamagedFriend)
                return;

            if (creep.heal(closestDamagedFriend) == ERR_NOT_IN_RANGE) {
                creep.travelTo(closestDamagedFriend);
            }
        }
    }
};
