import { profile } from "libs/Profiler-ts";
import { Process } from "../../../kernel/process";

@profile
export class DiplomatProcess extends Process {
  private _creep: Creep | null = null;
  public classPath(): string {
    return "DiplomatProcess";
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

    if (Game.flags.claimFlag && this._creep.room !== Game.flags.claimFlag.room)
      this.moveTowardsFlag();
    else if (Game.flags.claimFlag && this._creep.room === Game.flags.claimFlag.room) {
      this.claim();
    }

    return 0;
  }

  moveTowardsFlag() {
    if (!this._creep)
      return;

    this._creep.travelTo(Game.flags.claimFlag);
  }

  claim() {
    if (!this._creep)
      return;

    const controller = this._creep.room.controller;

    if (controller) {
      let ret = this._creep.claimController(controller);
      if (ret == ERR_NOT_IN_RANGE)
        this._creep.moveTo(controller);
    }
  }
}
