import { FighterMelee } from "./fighterMelee";
import "libs/Traveler/Traveler";

export class FighterMeleeForAnotherRoom {
    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if(creep.room != Game.flags.attackFlag.room){
            creep.travelTo(Game.flags.attackFlag);
        } else {
            FighterMelee.run(creep);
        }
    }
};
