import { Consts } from "consts";

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

export class BodyPartsReference {

    private _role: string;
    private _body: BodyPartRequest[];

    public get role(): string {
        return this._role;
    }
    public get body(): BodyPartRequest[] {
        return this._body;
    }

    constructor(role: string, bodyPartCount: BodyPartRequest[]) {
        this._role = role;
        this._body = bodyPartCount;
    }
}

export class CreepFactory {
    private _isBuilding: boolean = false;
    public isEmergencyState: boolean = false;

    private bodyPartsOrder: BodyPartConstant[] = [
        TOUGH,
        WORK,
        CARRY,
        ATTACK,
        RANGED_ATTACK,
        CLAIM,
        MOVE,
        HEAL
    ]

    public static BodyPartsReferenceByRole: BodyPartsReference[] = [
        // TOWNSFOLK
        new BodyPartsReference(Consts.roleHarvester, [
            new BodyPartRequest(WORK, 10),
            new BodyPartRequest(CARRY, 8),
            new BodyPartRequest(MOVE, 4)]),

        new BodyPartsReference(Consts.roleMiner, [
            new BodyPartRequest(WORK, 5),
            new BodyPartRequest(MOVE, 3)]),

        new BodyPartsReference(Consts.roleMinerLinker, [
            new BodyPartRequest(WORK, 5),
            new BodyPartRequest(CARRY, 8),
            new BodyPartRequest(MOVE, 3)]),

        new BodyPartsReference(Consts.roleCarrier, [
            new BodyPartRequest(CARRY, 10),
            new BodyPartRequest(MOVE, 10)]),

        new BodyPartsReference(Consts.roleCarrierTeleporter, [
            new BodyPartRequest(CARRY, 8),
            new BodyPartRequest(MOVE, 4)]),

        new BodyPartsReference(Consts.roleUpgrader, [
            new BodyPartRequest(WORK, 12),
            new BodyPartRequest(CARRY, 8),
            new BodyPartRequest(MOVE, 6)]),

        new BodyPartsReference(Consts.roleRepairer, [
            new BodyPartRequest(WORK, 6),
            new BodyPartRequest(CARRY, 6),
            new BodyPartRequest(MOVE, 3)]),

        new BodyPartsReference(Consts.roleBuilder, [
            new BodyPartRequest(WORK, 10),
            new BodyPartRequest(CARRY, 8),
            new BodyPartRequest(MOVE, 18)]),

        // ADVENTURERS
        new BodyPartsReference(Consts.rolePioneer, [
            new BodyPartRequest(WORK, 8),
            new BodyPartRequest(CARRY, 8),
            new BodyPartRequest(MOVE, 8)]),

        new BodyPartsReference(Consts.rolePillager, [
            new BodyPartRequest(WORK, 8),
            new BodyPartRequest(CARRY, 10),
            new BodyPartRequest(MOVE, 18)]),

        // MILITARY
        new BodyPartsReference(Consts.roleSoldier, [
            new BodyPartRequest(MOVE, 20),
            new BodyPartRequest(TOUGH, 10),
            new BodyPartRequest(ATTACK, 10)]),

        new BodyPartsReference(Consts.roleFighterMelee, [
            new BodyPartRequest(TOUGH, 10),
            new BodyPartRequest(ATTACK, 10),
            new BodyPartRequest(MOVE, 20)]),

        new BodyPartsReference(Consts.roleFighterMeleeForAnotherRoom, [
            new BodyPartRequest(TOUGH, 10),
            new BodyPartRequest(ATTACK, 10),
            new BodyPartRequest(MOVE, 20)]),

        new BodyPartsReference(Consts.roleFighterRanged, [
            new BodyPartRequest(TOUGH, 15),
            new BodyPartRequest(RANGED_ATTACK, 10),
            new BodyPartRequest(MOVE, 25)]),

        new BodyPartsReference(Consts.rolefighterHealer, [
            new BodyPartRequest(TOUGH, 10),
            new BodyPartRequest(HEAL, 10),
            new BodyPartRequest(MOVE, 20)])
    ];

    private _room: Room;

    constructor(room: Room) {
        this._room = room;
    }

    private GetBodyPartsInternal(desirableBody: BodyPartRequest[], sortBody: boolean = true): BodyPartConstant[] {
        let bodyParts: BodyPartConstant[] = [];
        let energyAvailable: number = this.isEmergencyState ? 300 : Math.max(this._room.energyAvailable, Math.max(this._room.energyCapacityAvailable / 2, 300));
        let isBuilding: boolean = true;

        while (energyAvailable > 0) {
            isBuilding = false;

            for (let part in desirableBody) {
                let db = desirableBody[part];
                let bodyPartCost = BODYPART_COST[db.bodyPart]
                if (_.filter(bodyParts, bp => bp == db.bodyPart).length < db.bodyPartCount && energyAvailable >= bodyPartCost) {
                    bodyParts.push(db.bodyPart);
                    energyAvailable -= bodyPartCost;
                    isBuilding = true;
                }
            }

            if (!isBuilding || energyAvailable === 0) {
                break;
            }
        }

        if (sortBody) {
            let finalBody: BodyPartConstant[] = [];
            for (let i = 0; i < this.bodyPartsOrder.length;) {
                let ret = bodyParts.indexOf(this.bodyPartsOrder[i]);
                if (ret > -1) {
                    finalBody.push(this.bodyPartsOrder[i]);
                    delete bodyParts[ret];
                }
                else {
                    i++;
                }
            }

            bodyParts = finalBody;
        }

        return bodyParts;
    }

    public GetBodyPartsByRole(role: string): BodyPartConstant[] {
        let bodyPartsReference: BodyPartsReference | undefined = _.find(CreepFactory.BodyPartsReferenceByRole, x => x.role == role);
        if (!bodyPartsReference)
            throw new RangeError('CreepFactory - Role not found');

        let bodyParts: BodyPartConstant[] = this.GetBodyPartsInternal(bodyPartsReference.body);

        return bodyParts;
    }

    public CreateCreep(role: string, memory?: CreepMemory) {
        if (this._isBuilding)
            return;

        if (!memory) {
            memory = { role: role, room: this._room.name }
        }

        if (!memory.role) {
            memory.role = role;
        }

        if (!memory.room) {
            memory.room = this._room.name;
        }

        if (!memory.otherResources) {
            memory.otherResources = [];
        }

        this._isBuilding = true;
        let bodyPartsReference: BodyPartsReference | undefined = _.find(CreepFactory.BodyPartsReferenceByRole, bp => bp.role === role);
        if (!bodyPartsReference)
            throw new Error('CreepFactory.CreateCreep - role not found on BodyPartsReferenceByRole - role: ' + role);

        const spawns : StructureSpawn[] | null = this._room.find(FIND_MY_STRUCTURES, { filter: s => s.structureType === STRUCTURE_SPAWN && !s.spawning });

        if (!spawns || spawns.length === 0)
            return;

        let ret = spawns[0].spawnCreep(this.GetBodyPartsByRole(role), this._room.name + '-' + role + '-' + Math.random().toString(36).substr(2, 5), { memory: memory });
    }
}
