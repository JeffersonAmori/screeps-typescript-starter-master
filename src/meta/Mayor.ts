import { Consts } from "consts";
import { filter, initial } from "lodash";
import { Defcon } from "military/defcon";
import { Mother } from "meta/Mother";
import { getMaxListeners } from "process";
import { RoleBuilder } from "roles/builder";
import { RoleCarrier } from "roles/carrier";
import { RoleCarrierTeleporter } from "roles/carrierTeleporter";
import { FighterMeleeForAnotherRoom } from "roles/fighterForAnotherRoom";
import { FighterHealer } from "roles/fighterHealer";
import { FighterMelee } from "roles/fighterMelee";
import { FighterRanged } from "roles/fighterRanged";
import { RoleHarvester } from "roles/harvester";
import { RoleMiner } from "roles/miner";
import { RoleMinerTeleporter } from "roles/minerTeleporter";
import { RolePioneer } from "roles/pioneer";
import { RoleRepairer } from "roles/repairer";
import { RoleUpgrader } from "roles/upgrader";
import { RoomData, RoomInfo } from "roomInfo";
import { ErrorMapper } from "utils/ErrorMapper";
import { Sheriff } from "./Sheriff";
import { RepairViaTowerProcess } from "OS/processes/tower/repairViaTower";
import * as kernel from "OS/kernel/kernel"
import { profile } from "libs/Profiler-ts";


@profile
export class Mayor {
    private _room: Room;

    constructor(spawn: Room) {
        this._room = spawn;
    }

    public govern() {
        checkForHostiles(this._room);
        let mother = new Mother(this._room);
        mother.CreateCreeps();

        const controller = this._room.controller;
        if (controller && controller.my) {
            let towerRepairProcess = new RepairViaTowerProcess(0, 0);
            towerRepairProcess = (<RepairViaTowerProcess>kernel.addProcessIfNoExists(towerRepairProcess));
            towerRepairProcess.setup(this._room.name);
        }
    }
}

function checkForHostiles(room: Room) {
    var hostiles = room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        const sheriff = new Sheriff(room);
        Defcon.run(room);
    }
}
