import { sortBy } from "lodash";
import { RoleBuilder } from "./builder";

export class RolePioneer {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        let targetSpawnRoom : StructureSpawn = _.sortBy(Game.spawns, s => s.room.controller?.level)[0];
        if (creep.room != targetSpawnRoom.room)
            creep.moveTo(targetSpawnRoom);
        else {
            RoleBuilder.run(creep)
        }
    }
}
