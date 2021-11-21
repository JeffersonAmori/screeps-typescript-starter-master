import { filter } from "lodash";
import { moveMessagePortToContext } from "worker_threads";
import { FighterMelee } from "./fighterMelee";

export class FighterMeleeForAnotherRoom {
    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        if(creep.room != Game.flags.attackFlag.room){
            creep.moveTo(Game.flags.attackFlag);
        } else {
            FighterMelee.run(creep);
        }
    }
};
