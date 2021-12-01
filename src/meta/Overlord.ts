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
import { Mayor } from "./Mayor";
import { RolePillager } from "roles/pillager";
import { RoleSoldier } from "roles/military/soldier";
import * as profiler from "libs/profiler/screeps-profiler"
import * as kernel from "OS/kernel/kernel"
import { MineProcess } from "OS/processes/process-mine";

export class Overlord {
    public static rule(): void {

        for (let s in Game.spawns) {
            const spawn: StructureSpawn = Game.spawns[s]; 0
            const mayor = new Mayor(spawn);
            mayor.govern();
        }
        CreepsAct();
    }
}

function CreepsAct() {
    const creeps = _.forEach(Game.creeps, creep => {
        switch (creep.memory.role) {
            case Consts.roleHarvester: {
                RoleHarvester.run(creep);
                break;
            }
            case Consts.roleMiner: {
                if(!creep.memory.processId || !kernel.getProcessById(creep.memory.processId)){
                    let mineProcess = kernel.addProcess(new MineProcess(0, 0));
                    mineProcess.setup(creep.id);
                    creep.memory.processId = mineProcess.pid;
                }
                // const roleMiner = new RoleMiner(creep);
                // roleMiner.run();
                //RoleMiner.run(creep);
                break;
            }
            case Consts.roleMinerTeleporter: {
                const roleMinerTeleporter = new RoleMinerTeleporter(creep);
                roleMinerTeleporter.run();
                //RoleMinerTeleporter.run(creep);
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
                const roleUpgrader = new RoleUpgrader(creep);
                roleUpgrader.run();
                // RoleUpgrader.run(creep)
                break;
            }
            case Consts.roleBuilder: {
                RoleBuilder.run(creep);
                break;
            }
            case Consts.roleRepairer: {
                const roleRepairer = new RoleRepairer(creep);
                roleRepairer.run();
                //RoleRepairer.run(creep);
                break;
            }
            case Consts.rolePioneer: {
                RolePioneer.run(creep);
                break;
            }
            case Consts.rolePillager: {
                const rolePillager = new RolePillager(creep);
                rolePillager.run();
                //console.log(JSON.stringify(result));
                //RolePillager.run(creep);
                break;
            }
            case Consts.roleSoldier: {
                const roleSoldier = new RoleSoldier(creep);
                roleSoldier.run();
                //console.log(JSON.stringify(result));
                //RolePillager.run(creep);
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
    });
}
