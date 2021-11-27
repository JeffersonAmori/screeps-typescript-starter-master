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
import { RolePillager } from "roles/pillager";


export class Mayor {
    private _spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this._spawn = spawn;
    }

    public govern() {
        checkForHostiles(this._spawn);
        //CreepsAct(this._spawn);
        let mother = new Mother(this._spawn);
        mother.CreateCreeps();
    }
}

function checkForHostiles(spawn: StructureSpawn) {
    var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        const sheriff = new Sheriff(spawn);
        Defcon.run(spawn);
    }
}

function CreepsAct(spawn: StructureSpawn) {
    const creeps = spawn.room.find(FIND_MY_CREEPS)
    for (var name in creeps) {
        var creep = creeps[name];
        switch (creep.memory.role) {
            case Consts.roleHarvester: {
                RoleHarvester.run(creep);
                break;
            }
            case Consts.roleMiner: {
                RoleMiner.run(creep);
                break;
            }
            case Consts.roleMinerTeleporter: {
                RoleMinerTeleporter.run(creep);
                break;
            }
            case Consts.roleCarrier: {
                RoleCarrier.run(creep);
                break;
            }
            case Consts.roleCarrierTeleporter: {
                RoleCarrierTeleporter.run(creep);
                break;
            }
            case Consts.roleUpgrader: {
                RoleUpgrader.run(creep);
                break;
            }
            case Consts.roleBuilder: {
                RoleBuilder.run(creep);
                break;
            }
            case Consts.roleRepairer: {
                RoleRepairer.run(creep);
                break;
            }
            case Consts.rolePioneer: {
                RolePioneer.run(creep);
                break;
            }
            case Consts.rolePillager: {
                RolePillager.run(creep);
                break;
            }
            case Consts.roleFighterMelee: {
                FighterMelee.run(creep);
                break;
            }
            case Consts.roleFighterMeleeForAnotherRoom: {
                FighterMeleeForAnotherRoom.run(creep);
                break;
            }
            case Consts.roleFighterRanged: {
                FighterRanged.run(creep);
                break;
            }
            case Consts.rolefighterHealer: {
                FighterHealer.run(creep);
                break;
            }
            default: {
                break;
            }
        }
    }
}

