import { Consts } from "consts";
import { MyStructureSpawn } from "structure/spawn";
import { MyStructureTower } from "structure/tower";

export class Defcon {
    public static run(spawn: any): void {
        var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${spawn.room.name}`);

        if (hostiles.length > 1) {
            const fighterCount = _.filter(Game.creeps, (c: Creep) => c.memory.role === 'meleeFighter');
            const rangedCounter = _.filter(Game.creeps, (c: Creep) => c.memory.role === 'rangedFighter');
            const healerCounter = _.filter(Game.creeps, (c: Creep) => c.memory.role === 'healerFighter');
            if (rangedCounter.length < fighterCount.length / 2) {
                MyStructureSpawn.trySpawnCreep(spawn, Consts.meleeFighterBody, 'rangedFighter');
            } else if (healerCounter < rangedCounter) {
                MyStructureSpawn.trySpawnCreep(spawn, Consts.healerFighterBody, 'healerFighter');
            }
            else {
                MyStructureSpawn.trySpawnCreep(spawn, Consts.meleeFighterBody, 'meleeFighter');
            }
        }

        MyStructureTower.run(spawn.room);
    }
}
