import { RoleUpgrader } from "./upgrader";

export class RoleUpgraderForAnotherRoom {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if (creep.room != Game.flags.attackFlag.room)
            creep.moveTo(Game.flags.attackFlag);
        else {
            RoleUpgrader.run(creep)
        }
    }
}
