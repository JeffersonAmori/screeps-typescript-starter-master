import { Consts } from "consts";
import { profile } from "libs/Profiler-ts";
import { Process } from "OS/kernel/process";
import { getEnergyProcess } from "../common/getEnergy";
import { UpgraderProcess } from "./upgrader";

@profile
export class BuilderProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "BuilderProcess";
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

        if (this._creep.memory.working && this._creep.store.getUsedCapacity() === 0) {
            this._creep.memory.working = false;
            delete this._creep.memory.targetConstructionSiteId;
            this._creep.say('harvesting');
            if (this._creep.memory.role !== Consts.roleBuilder)
                this.kernel.killProcess(this.pid);
        }

        if (!this._creep.memory.working && this._creep.store.getFreeCapacity() === 0) {
            this._creep.memory.working = true;
            this._creep.say('building');
            if (this._creep.memory.role !== Consts.roleBuilder)
                this.kernel.killProcess(this.pid);
        }

        if (this._creep.memory.working) {
            if (!this._creep.memory.targetConstructionSiteId) {
                this.workingWithTargetConstructionSiteId();

                if (!this._creep.memory.targetConstructionSiteId) {
                    const upgraderProcess = this.kernel.forkProcess(this, new UpgraderProcess(0, this.pid));
                    upgraderProcess.setup(this.memory.creepId);
                }
            } else if (this._creep.memory.targetConstructionSiteId) {
                this.workingWithoutTargetConstructionSiteId();
            }
            else {
            }
        }
        else {
            const getEnergy = this.kernel.forkProcess(this, new getEnergyProcess(0, this.pid));
            getEnergy.setup(this.memory.creepId);
        }

        return 0;
    }

    private workingWithoutTargetConstructionSiteId() {
        if (!this._creep || !this._creep.memory.targetConstructionSiteId)
            return;

        let target = Game.getObjectById<ConstructionSite>(this._creep.memory.targetConstructionSiteId);
        if (target) {
            if (this._creep.build(target) == ERR_NOT_IN_RANGE) {
                this._creep.travelTo(target);
            }
        }
        else {
            delete this._creep.memory.targetConstructionSiteId;
        }
    }

    private workingWithTargetConstructionSiteId() {
        if (!this._creep)
            return;

        const constructionSite = this._creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if (constructionSite) {
            this._creep.memory.targetConstructionSiteId = constructionSite.id;
        } else {
            delete this._creep.memory.targetConstructionSiteId;
        }
    }
}
