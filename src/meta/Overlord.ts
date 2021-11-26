import { Consts } from "consts";
import { filter, initial } from "lodash";
import { Defcon } from "military/defcon";
import { Mother } from "Mother";
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

export class Overlord {
    public static rule() : void {
        try {
            CreepsAct();
        } catch (error) {
            console.log('Error on CreepsAct ' + (<Error>error).message);
            throw error;
        }

        for (let s in Game.spawns) {
            const spawn: StructureSpawn = Game.spawns[s]; 0

            checkForHostiles(spawn);
            let mother = new Mother(spawn);
            mother.CreateCreeps();
        }
    }
}

function CreepsAct() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
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

function checkForHostiles(spawn: StructureSpawn) {
    var hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        Defcon.run(spawn);
    }
}
