import { ProcessPriority } from "OS/kernel/constants";
import { Process } from "OS/kernel/process";
import { PillagerProcess } from "OS/processes/creep/explorers/pillager";
import { PioneerProcess } from "OS/processes/creep/explorers/pioneer";
import { SoldierProcess } from "OS/processes/creep/military/soldier";
import { BuilderProcess } from "OS/processes/creep/townsfolk/builder";
import { CarrierProcess } from "OS/processes/creep/townsfolk/carrier";
import { CarrierLinkerProcess } from "OS/processes/creep/townsfolk/carrierLinker";
import { HarvesterProcess } from "OS/processes/creep/townsfolk/harvester";
import { MinerProcess } from "OS/processes/creep/townsfolk/miner";
import { MinerLinkerProcess } from "OS/processes/creep/townsfolk/minerLinker";
import { RepairerProcess } from "OS/processes/creep/townsfolk/repairer";
import { UpgraderProcess } from "OS/processes/creep/townsfolk/upgrader";
import { Consts } from "consts";
import { scanRooms } from "libs/GlitchAssassin/Intel/Rooms";
import { profile } from "libs/Profiler-ts";
import * as _ from 'lodash';
import { DiplomatProcess } from "../OS/processes/creep/diplomacy/diplomat";
import { MayorProcess } from "./Mayor";

@profile
export class Overlord extends Process {
  public classPath() {
    return 'Overlord';
  }

  public setup(..._: any[]): Process {
    return this;
  }

  public run(): number {
    for (let r in Game.rooms) {
      const room: Room = Game.rooms[r];
      if (!room || !room.controller || !room.controller.my)
        continue;

      if (!GlobalMemory.RoomInfo[r].mayorProcessId || !this.kernel.getProcessById(GlobalMemory.RoomInfo[r].mayorProcessId!)) {
        let mayorProcess = this.kernel.addProcess(new MayorProcess(0, this.pid, ProcessPriority.TiclyLast));
        mayorProcess.setup(r);
        GlobalMemory.RoomInfo[r].mayorProcessId = mayorProcess.pid;
      }
    }

    scanRooms();

    this.CreepsAct();

    return 0;
  }

  CreepsAct(): void {
    _.forEach(Game.creeps, creep => {
      if (creep.spawning) return;

      switch (creep.memory.role) {
        case GlobalConsts.roleHarvester: {
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
        case Consts.roleDiplomat: {
          this.startCreepProcess(creep, new DiplomatProcess(0, this.pid));
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
