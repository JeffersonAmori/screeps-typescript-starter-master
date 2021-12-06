import { Consts } from "consts";
import { FighterMeleeForAnotherRoom } from "roles/fighterForAnotherRoom";
import { FighterHealer } from "roles/fighterHealer";
import { FighterMelee } from "roles/fighterMelee";
import { FighterRanged } from "roles/fighterRanged";
import { MayorProcess } from "./Mayor";
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
import { GlobalMemory } from "GlobalMemory";
import { ProcessPriority } from "OS/kernel/constants";

@profile
export class Overlord extends Process {
    public classPath(){
        return 'Overlord';
    }

    public run(): number {
        for (let r in Game.rooms) {
            if (GlobalMemory.RoomInfo[r].mayorProcessId)
                if (!this.kernel.getProcessById(GlobalMemory.RoomInfo[r].mayorProcessId!))
                    delete GlobalMemory.RoomInfo[r].mayorProcessId;

            if (!GlobalMemory.RoomInfo[r].mayorProcessId) {
                let mayorProcess = this.kernel.addProcess(new MayorProcess(0, this.pid, ProcessPriority.TiclyLast));
                mayorProcess.setup(r);
                GlobalMemory.RoomInfo[r].mayorProcessId = mayorProcess.pid;
            }
        }

        this.CreepsAct();

        return 0;
    }

    CreepsAct(): void {
        _.forEach(Game.creeps, creep => {
            switch (creep.memory.role) {
                case Consts.roleHarvester: {
                    this.startCreepProcess(creep, new HarvesterProcess(0, this.pid));
                    break;
                }
                case Consts.roleMiner: {
                    this.startCreepProcess(creep, new MinerProcess(0, this.pid));
                    break;
                }
                case Consts.roleMinerLinker: {
                    this.startCreepProcess(creep, new MinerLinkerProcess(0, this.pid));
                    break;
                }
                case Consts.roleCarrier: {
                    this.startCreepProcess(creep, new CarrierProcess(0, this.pid));
                    break;
                }
                case Consts.roleCarrierTeleporter: {
                    this.startCreepProcess(creep, new CarrierLinkerProcess(0, this.pid));
                    break;
                }
                case Consts.roleUpgrader: {
                    this.startCreepProcess(creep, new UpgraderProcess(0, this.pid));
                    break;
                }
                case Consts.roleBuilder: {
                    this.startCreepProcess(creep, new BuilderProcess(0, this.pid));
                    break;
                }
                case Consts.roleRepairer: {
                    this.startCreepProcess(creep, new RepairerProcess(0, this.pid));
                    break;
                }
                case Consts.rolePioneer: {
                    this.startCreepProcess(creep, new PioneerProcess(0, this.pid));
                    break;
                }
                case Consts.rolePillager: {
                    this.startCreepProcess(creep, new PillagerProcess(0, this.pid));
                    break;
                }
                case Consts.roleSoldier: {
                    this.startCreepProcess(creep, new SoldierProcess(0, this.pid));
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

    startCreepProcess(creep: Creep, process: Process): void {
        if (!creep.memory.processId || !this.kernel.getProcessById(creep.memory.processId)) {
            let newProcess = this.kernel.addProcess(process);
            newProcess.setup(creep.id);
            creep.memory.processId = newProcess.pid;
        }
    }
}
