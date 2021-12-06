import { Consts } from "consts";
import { RoleBuilder } from "roles/builder";
import { RoleCarrierTeleporter } from "roles/carrierTeleporter";
import { FighterMeleeForAnotherRoom } from "roles/fighterForAnotherRoom";
import { FighterHealer } from "roles/fighterHealer";
import { FighterMelee } from "roles/fighterMelee";
import { FighterRanged } from "roles/fighterRanged";
import { RolePioneer } from "roles/pioneer";
import { Mayor } from "./Mayor";
import { RoleSoldier } from "roles/military/soldier";
import * as kernel from "OS/kernel/kernel"
import { MinerProcess } from "OS/processes/creep/townsfolk/miner";
import { UpgraderProcess } from "OS/processes/creep/townsfolk/upgrader";
import { Process } from "OS/kernel/process";
import { RepairerProcess } from "OS/processes/creep/townsfolk/repairer";
import { PillagerProcess } from "OS/processes/creep/explorers/pillager";
import { MinerLinkerProcess } from "OS/processes/creep/townsfolk/minerLinker";
import { CarrierProcess } from "OS/processes/creep/townsfolk/carrier";
import { HarvesterProcess } from "OS/processes/creep/townsfolk/harvester";
import { CarrierLinkerProcess } from "OS/processes/creep/townsfolk/carrierLinker";
import { BuilderProcess } from "OS/processes/creep/townsfolk/builder";
import { PioneerProcess } from "OS/processes/creep/explorers/pioneer";
import { SoldierProcess } from "OS/processes/creep/military/soldier";
import { profile } from "libs/Profiler-ts";

@profile
export class Overlord {
    public static rule(): void {
        for (let r in Game.rooms) {
            const room: Room = Game.rooms[r]; 0
            const mayor = new Mayor(room);
            mayor.govern();
        }
        Overlord.CreepsAct();
    }

    static CreepsAct(): void {
        const creeps = _.forEach(Game.creeps, creep => {
            switch (creep.memory.role) {
                case Consts.roleHarvester: {
                    Overlord.startCreepProcess(creep, new HarvesterProcess(0, 0));
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
                    Overlord.startCreepProcess(creep, new CarrierProcess(0, 0));
                    break;
                }
                case Consts.roleCarrierTeleporter: {
                    Overlord.startCreepProcess(creep, new CarrierLinkerProcess(0, 0));
                    break;
                }
                case Consts.roleUpgrader: {
                    Overlord.startCreepProcess(creep, new UpgraderProcess(0, 0));
                    break;
                }
                case Consts.roleBuilder: {
                    Overlord.startCreepProcess(creep, new BuilderProcess(0, 0));
                    break;
                }
                case Consts.roleRepairer: {
                    Overlord.startCreepProcess(creep, new RepairerProcess(0, 0));
                    break;
                }
                case Consts.rolePioneer: {
                    Overlord.startCreepProcess(creep, new PioneerProcess(0, 0));
                    break;
                }
                case Consts.rolePillager: {
                    Overlord.startCreepProcess(creep, new PillagerProcess(0, 0));
                    break;
                }
                case Consts.roleSoldier: {
                    Overlord.startCreepProcess(creep, new SoldierProcess(0, 0));
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

    static startCreepProcess(creep: Creep, process: Process): void{
        if (!creep.memory.processId || !kernel.getProcessById(creep.memory.processId)) {
            let newProcess = kernel.addProcess(process);
            newProcess.setup(creep.id);
            creep.memory.processId = newProcess.pid;
        }
    }
}
