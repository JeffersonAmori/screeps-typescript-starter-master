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


export class Mayor {
    private _spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this._spawn = spawn;
    }

    public govern() {
        checkForHostiles(this._spawn);
        let mother = new Mother(this._spawn);
        mother.CreateCreeps();

        const controller = this._spawn.room.controller;
        if (controller && controller.my) {
            let towerRepairProcess = new RepairViaTowerProcess(0, 0);
            towerRepairProcess = (<RepairViaTowerProcess>kernel.addProcess(towerRepairProcess));
            towerRepairProcess.setup(this._spawn.room.name);
        }
    }
}

function checkForHostiles(spawn: StructureSpawn) {
    var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        const sheriff = new Sheriff(spawn);
        Defcon.run(spawn);
    }
}
