import { RoleCommon } from "./_common";
import { Traveler } from "../libs/Traveler/Traveler";
import { Consts } from "consts";
import { GlobalMemory } from "GlobalMemory";

export class RoleCarrier {
    public static run(creep: Creep): void {
        /** @param {Creep} creep **/

        if (creep.memory.working && creep.store.getFreeCapacity() == 0) {

        }
    }
};
