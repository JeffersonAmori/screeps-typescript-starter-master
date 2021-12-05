import { Process } from "OS/kernel/process";
import { RoleRepairer } from "roles/repairer";
import { RoleCommon } from "roles/_common";

export class BuilderProcess extends Process {
    private _creep: Creep | null = null;

    public classPath(): string {
        return "BuilderProcess";
    }

    // _[0] - creepId
    public setup(..._: any[]) {
        this.memory.creepId = _[0];
    }

    public run(): number {
        if (!this._creep)
            return -1;

        if (this._creep.memory.working && this._creep.store.getUsedCapacity() === 0) {
            this._creep.memory.working = false;
            delete this._creep.memory.targetConstructionSiteId;
            this._creep.say('harvesting');
        }

        if (!this._creep.memory.working && this._creep.store.getFreeCapacity() === 0) {
            this._creep.memory.working = true;
            this._creep.say('building');
        }

        if (this._creep.memory.working) {
            if (!this._creep.memory.targetConstructionSiteId) {
                this.workingWithTargetConstructionSiteId();
            } else if (this._creep.memory.targetConstructionSiteId) {
                this.workingWithoutTargetConstructionSiteId();
            }
            else {
                RoleRepairer.run(this._creep);
            }
        }
        else {
            RoleCommon.getEnergy(this._creep);
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
