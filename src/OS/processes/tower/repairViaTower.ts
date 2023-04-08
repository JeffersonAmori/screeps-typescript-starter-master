import { profile } from "libs/Profiler-ts";
import { Process } from "OS/kernel/process";
import * as _ from 'lodash';

@profile
export class RepairViaTowerProcess extends Process {

  public classPath(): string {
    return "RepairViaTowerProcess";
  }

  // _[0] - roomName
  setup(..._: any) {
    this.memory.roomName = _[0];
    return this;
  }

  run(): number {
    if (!this.memory.roomName) {
      console.log('RepairViaTowerProcess - memory.roomName is no set.')
      return -1;
    }
    const currentRoom = Game.rooms[this.memory.roomName];
    const towers: StructureTower[] | null = currentRoom.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_TOWER && (s.store.getUsedCapacity(RESOURCE_ENERGY)) >= (s.store.getCapacity(RESOURCE_ENERGY) / 4) });
    if (!towers || towers.length === 0) {
      this.kernel.sleepProcessByTime(this, 300);
      return 0;
    }

    if (!this.memory.targetStructureToRepair) {
      let structures = currentRoom.find(FIND_STRUCTURES, { filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL) });
      if (!structures || structures.length === 0) {
        this.kernel.killProcess(this.pid);
        return -1;
      }

      //  const rcl = Game.rooms[this.memory.roomName].controller!.level;
      //let targetStructure = _.sortBy(structures, s => (s.hits / s.hitsMax && s.structureType !== STRUCTURE_RAMPART) || (s.hits / (s.hitsMax / (rcl * rcl * 100)) && s.structureType === STRUCTURE_RAMPART))[0];
      const targetStructure = _.sortBy(structures, s => (s.hits / s.hitsMax))[0];

      this.memory.targetStructureToRepair = targetStructure.id;
    }

    const targetStructure = Game.getObjectById<AnyStructure>(this.memory.targetStructureToRepair);

    if (!targetStructure) {
      this.kernel.killProcess(this.pid);
      return -1;
    }

    towers.forEach(t => t.repair(targetStructure));
    this.kernel.killProcess(this.pid);
    return 0;

  }
}
