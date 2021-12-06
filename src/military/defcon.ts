
export class Defcon {
    public static run(room: Room): void {
        var hostiles = room.find(FIND_HOSTILE_CREEPS);
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${room.name}`);

        if (hostiles.length > 1) {
            let towers: Structure[] = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
            for (let t in towers) {
                let closestEnemy = towers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestEnemy) {
                    (<StructureTower>towers[t]).attack(closestEnemy);
                }
                // towers.forEach(tower => tower.attack(tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)));
                // let factory: CreepFactory = new CreepFactory(room);

                // const fighterCount = _.filter(Game.creeps, (c: Creep) => c.memory.role === Consts.roleFighterMelee);
                // const rangedCounter = _.filter(Game.creeps, (c: Creep) => c.memory.role === Consts.roleFighterRanged);
                // const healerCounter = _.filter(Game.creeps, (c: Creep) => c.memory.role === Consts.rolefighterHealer);

                // if (rangedCounter.length < fighterCount.length / 2) {
                //     factory.CreateCreep(Consts.roleFighterRanged, { role: Consts.roleFighterRanged, working: false, room: room.room, otherResources: [] })
                // } else if (healerCounter < rangedCounter) {
                //     factory.CreateCreep(Consts.rolefighterHealer, { role: Consts.rolefighterHealer, working: false, room: room.room, otherResources: [] })
                // }
                // else {
                //     factory.CreateCreep(Consts.roleFighterMelee, { role: Consts.roleFighterMelee, working: false, room: room.room, otherResources: [] })
                // }
            }

        }
    }
}
