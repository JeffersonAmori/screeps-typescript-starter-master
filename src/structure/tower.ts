/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.tower');
 * mod.thing == 'a thing'; // true
 */

function defendRoom(room: Room) {
    var hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        let towers: Structure[] = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
        for (let t in towers) {
            let closestEnemy = towers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestEnemy) {
                (<StructureTower>towers[t]).attack(closestEnemy);
            }
        }
        // towers.forEach(tower => tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)));
    }
}

export class MyStructureTower {
    /**
     * @param {Room}
     *            roomName *
     */
    public static run(roomName: Room): void {

        var hostiles = roomName.find(FIND_HOSTILE_CREEPS);

        if (hostiles.length > 0) {
            defendRoom(roomName);
        }
        // if (false) {
        //     var towers = roomName.find(
        //         FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
        //     towers.forEach(tower => {
        //         if (tower.energy > 500) {
        //             var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
        //                 filter: (structure) => (structure.hits < (structure.hitsMax < 50000 ? structure.hitsMax : 50000))
        //             });

        //             if (closestDamagedStructure) {
        //                 if (closestDamagedStructure.hits < (closestDamagedStructure.hitsMax < 50000 ? closestDamagedStructure.hitsMax : 50000)) {
        //                     if (tower.energy > 500) {
        //                         tower.repair(closestDamagedStructure);
        //                     }
        //                 }
        //             }
        //         }
        //     })
        // }
    }


}
