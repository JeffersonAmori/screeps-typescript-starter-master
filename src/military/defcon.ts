import { Consts } from "consts";
import { CreepFactory } from "creepFactory";
import { MyStructureSpawn } from "structure/spawn";
import { MyStructureTower } from "structure/tower";

export class Defcon {
    public static run(spawn: any): void {
        var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${spawn.room.name}`);

        if (hostiles.length > 1) {
            let factory: CreepFactory = new CreepFactory(spawn);

            const fighterCount = _.filter(Game.creeps, (c: Creep) => c.memory.role === Consts.roleFighterMelee);
            const rangedCounter = _.filter(Game.creeps, (c: Creep) => c.memory.role ===  Consts.roleFighterRanged);
            const healerCounter = _.filter(Game.creeps, (c: Creep) => c.memory.role ===  Consts.rolefighterHealer);

            if (rangedCounter.length < fighterCount.length / 2) {
                factory.CreateCreep(Consts.roleFighterRanged, { role: Consts.roleFighterRanged, working: false, room: spawn.room, otherResources: [], myContainerId: '' })
            } else if (healerCounter < rangedCounter) {
                factory.CreateCreep(Consts.rolefighterHealer, { role: Consts.rolefighterHealer, working: false, room: spawn.room, otherResources: [], myContainerId: '' })
            }
            else {
                factory.CreateCreep(Consts.roleFighterMelee, { role: Consts.roleFighterMelee, working: false, room: spawn.room, otherResources: [], myContainerId: '' })
            }
        }

        MyStructureTower.run(spawn.room);
    }
}
