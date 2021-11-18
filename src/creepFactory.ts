export class BodyPartRequest {
    private _bodyPart: BodyPartConstant;
    private _bodyPartCount: number;

    public get bodyPart(): BodyPartConstant {
        return this._bodyPart;
    }
    public get bodyPartCount(): number {
        return this._bodyPartCount;
    }

    constructor(bodyPart: BodyPartConstant, bodyPartCount: number) {
        this._bodyPart = bodyPart;
        this._bodyPartCount = bodyPartCount;
    }

}

export class CreepFactory {
    private _spawn: StructureSpawn;

    constructor(spawn: StructureSpawn) {
        this._spawn = spawn;
    }

    private GetBodyPartsInternal(desirableBody: BodyPartRequest[]): BodyPartConstant[] {
        let bodyParts: BodyPartConstant[] = [];
        let energyAvailable: number = this._spawn.room.energyCapacityAvailable
        let isBuilding: boolean = true;

        while (energyAvailable > 0) {
            isBuilding = false;

            for (let part in desirableBody) {
                if (_.filter(bodyParts, bp => bp == desirableBody[part].bodyPart).length < desirableBody[part].bodyPartCount) {
                    bodyParts.push(desirableBody[part].bodyPart);
                    energyAvailable -= BODYPART_COST[desirableBody[part].bodyPart];
                    isBuilding = true;
                }
            }

            if (!isBuilding) {
                break;
            }
        }

        return bodyParts;
    }

    public GetHarvesterBodyParts(): BodyPartConstant[] {
        let desirableBody: BodyPartRequest[] = [
            new BodyPartRequest(WORK, 5),
            new BodyPartRequest(MOVE, 3)
        ];

        let bodyParts: BodyPartConstant[] = this.GetBodyPartsInternal(desirableBody)

        return bodyParts;
    }
}
