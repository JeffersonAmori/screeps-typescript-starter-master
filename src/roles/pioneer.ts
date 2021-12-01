import { RoleBuilder } from "./builder";
import "libs/Traveler/Traveler";

export class RolePioneer {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        let targetSpawnRoom : StructureSpawn | Flag = Game.flags.colonizeFlag || _.sortBy(Game.spawns, s => s.room.controller?.level)[0];
        if (creep.room != targetSpawnRoom.room)
            creep.travelTo(targetSpawnRoom);
        else {
            RoleBuilder.run(creep)
        }
    }
}
