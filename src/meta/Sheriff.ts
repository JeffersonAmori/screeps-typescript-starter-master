import { Process } from "OS/kernel/process";

export class SheriffProcess extends Process {
    private _room: Room | null = null;

    public classPath(): string {
        return 'SheriffProcess';
    }

    public run(): number {
        this._room = Game.rooms[this.memory.roomName];
        console.log('Mother run ' + this._room.name);
        if (!this._room) {
            this.kernel.killProcess(this.pid);
            return -1;
        }

        this.defendTown();

        return 0;
    }

    // _[0] = roomName
    public setup(..._: any) {
        this.memory.roomName = _[0];
    }

    defendTown() {
        if (!this._room) {
            return;
        }

        var hostiles = this._room.find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 1) {
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${this._room.name}`);

            let towers: Structure[] = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
            for (let t in towers) {
                let closestEnemy = towers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if (closestEnemy) {
                    (<StructureTower>towers[t]).attack(closestEnemy);
                }
            }
        }
    }
}
