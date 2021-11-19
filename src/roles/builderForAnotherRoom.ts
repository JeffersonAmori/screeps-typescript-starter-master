import { RoleBuilder } from "./builder";

export class RoleBuilderForAnotherRoom {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if (creep.room != Game.flags.attackFlag.room)
            creep.moveTo(Game.flags.attackFlag);
        else {
            RoleBuilder.run(creep)
        }
    }
}
