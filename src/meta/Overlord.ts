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
import * as kernel from "OS/kernel/kernel"
import { MinerProcess } from "OS/processes/creep/townsfolk/miner";
import { UpgradeProcess } from "OS/processes/creep/townsfolk/upgrader";
import { Process } from "OS/kernel/process";
import { RepairerProcess } from "OS/processes/creep/townsfolk/repairer";
import { PillagerProcess } from "OS/processes/creep/explorers/pillager";
import { MinerLinkerProcess } from "OS/processes/creep/townsfolk/minerLinker";

export class Overlord {
    public static rule(): void {
        for (let s in Game.spawns) {
            const spawn: StructureSpawn = Game.spawns[s]; 0
            const mayor = new Mayor(spawn);
            mayor.govern();
        }
        Overlord.CreepsAct();
    }

    static CreepsAct(): void {
        const creeps = _.forEach(Game.creeps, creep => {
            switch (creep.memory.role) {
                case Consts.roleHarvester: {
                    RoleHarvester.run(creep);
                    break;
                }
                case Consts.roleMiner: {
                    Overlord.startCreepProcess(creep, new MinerProcess(0, 0));
                    break;
                }
                case Consts.roleMinerLinker: {
                    Overlord.startCreepProcess(creep, new MinerLinkerProcess(0, 0));
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
                    Overlord.startCreepProcess(creep, new UpgradeProcess(0, 0));
                    break;
                }
                case Consts.roleBuilder: {
                    RoleBuilder.run(creep);
                    break;
                }
                case Consts.roleRepairer: {
                    Overlord.startCreepProcess(creep, new RepairerProcess(0, 0));
                    break;
                }
                case Consts.rolePioneer: {
                    RolePioneer.run(creep);
                    break;
                }
                case Consts.rolePillager: {
                    Overlord.startCreepProcess(creep, new PillagerProcess(0, 0));
                    break;
                }
                case Consts.roleSoldier: {
                    const roleSoldier = new RoleSoldier(creep);
                    roleSoldier.run();
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
        })
    }

    static startCreepProcess(creep: Creep, process: Process<CreepState>): void{
        if (!creep.memory.processId || !kernel.getProcessById(creep.memory.processId)) {
            let newProcess = kernel.addProcess(process);
            newProcess.setup(creep.id);
            creep.memory.processId = newProcess.pid;
        }
    }
}
