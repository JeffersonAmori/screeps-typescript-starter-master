import { Consts } from "consts";
import { profile } from "libs/Profiler-ts/Profiler";
import { Process } from "OS/kernel/process";
import { getEnergyProcess } from "../common/getEnergy";
import { BuilderProcess } from "./builder";
import * as _ from 'lodash';

@profile
export class RepairerProcess extends Process {
  private _creep: Creep | null = null;

  public classPath(): string {
    return "RepairerProcess";
  }

  // _[0] - creepId
  public setup(..._: any[]) {
    this.memory.creepId = _[0];
    return this;
  }

  public run(): number {

    this._creep = Game.getObjectById<Creep>(this.memory.creepId);
    if (!this._creep) {
      this.kernel.killProcess(this.pid);
      return -1;
    }

    if (this._creep.memory.working && this._creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
      this._creep.memory.working = false;
      this._creep.say('harvesting');
      if (this._creep.memory.role !== Consts.roleRepairer)
        this.kernel.killProcess(this.pid);
    }

    if (!this._creep.memory.working && this._creep.store.getUsedCapacity(RESOURCE_ENERGY) === this._creep.store.getCapacity(RESOURCE_ENERGY)) {
      this._creep.memory.working = true;
      this._creep.say('repairing');
      if (this._creep.memory.role !== Consts.roleRepairer)
        this.kernel.killProcess(this.pid);
    }

    if (this._creep.memory.working) {
      if (!this._creep.memory.structureToRepairId)
        this.findConstructionSite();

      if (this._creep.memory.structureToRepairId)
        this.repair();
    }
    else {
      this.getEnergy();
    }

    return 0;
  }

  findConstructionSite() {
    if (!this._creep)
      return;

    let structures = this._creep.room.find(FIND_STRUCTURES, {
      filter: (s) => (s.hits < s.hitsMax && s.structureType !== STRUCTURE_WALL)
    });

    if (!structures) {
      this.kernel.forkProcess(this, new BuilderProcess(0, this.pid))
        .setup(this.memory.creepId);
      return;
    }

    //const rcl = this._creep.room.controller!.level;
    //let targetStructure = _.sortBy(structures, s => [(s.hits / s.hitsMax && s.structureType !== STRUCTURE_RAMPART) || (s.hits / (s.hitsMax / (rcl * rcl * 100)) && s.structureType === STRUCTURE_RAMPART)])[0];
    let targetStructure = _.sortBy(structures, s => (s.hits / s.hitsMax))[0];
    this._creep.memory.structureToRepairId = targetStructure.id;

    return;
  }

  repair() {
    if (!this._creep || !this._creep.memory.structureToRepairId)
      return;

    const structureToRepair: Structure | null = Game.getObjectById<Structure>(this._creep.memory.structureToRepairId);

    if (!structureToRepair)
      return;

    if (structureToRepair.hits === structureToRepair.hitsMax) {
      delete this._creep.memory.structureToRepairId;
      return;
    }

    if (this._creep.repair(structureToRepair) === ERR_NOT_IN_RANGE) {
      this._creep.travelTo(structureToRepair);
    }

    return;
  }

  getEnergy() {
    if (!this._creep)
      return;

    delete this._creep.memory.structureToRepairId;
    let p = this.kernel.forkProcess(this, new getEnergyProcess(0, this.pid));
    p.setup(this.memory.creepId);

    return;
  }
};
