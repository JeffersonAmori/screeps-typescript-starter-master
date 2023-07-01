declare var log: any;
declare var Profiler: Profiler;
declare var kernel: any;
declare var GlobalMemory: any;
declare var KernelMemory: KernelMemory;
declare var GlobalConsts: Consts

interface KernelMemory {
    printProcess: boolean;
}

interface Memory {
    RoomsInfo: string;
    Started: boolean;
    RunArchitect: boolean;
    kernelMemory: KernelMemory;
}

interface CreepMemory {
    forceMoveToTargetContainer?: boolean;
    isRenewing?: boolean;
    otherResources?: ResourceConstant[];
    linkReadyForActivation?: boolean;
    role: string;
    room?: string;
    structureToRepairId?: string;
    targetConstructionSiteId?: string;
    targetContainerId?: string;
    targetEnemyId?: string;
    targetEnergySourceId?: string;
    targetEnergyDepositId?: string;
    targetStructureLinkId?: string;
    working?: boolean;
    processId?: number;
}

    // Memory extension samples
interface RoomMemory {
    controllerId?: Id<StructureController>,
    sourceIds?: Id<Source>[],
    mineralId?: Id<Mineral>,
    mineralType?: MineralConstant,
    rcl?: number,
    owner?: string,
    reserver?: string,
    reservation?: number,
    rclMilestones?: Record<number, number>,
    eligibleForOffice?: boolean,
    lastHostileSeen?: number,
    invaderCore?: number,
    avoid?: number
}

interface RoomData {
    sumOfDistancesToSourcesFromSpawnHeuristic?: number;
    storageLinkId?: string | null;
    upgraderContainerId?: string | null;
    towerRepairProcessId?: number | null;
    mayorProcessId?: number | null ;
    motherProcessId?: number | null;
    noActiveResourceHarvest?: boolean;
    sheriffProcessId?: number | null;
    spawnCreepQueue: string[];
    processes: { [id: string]: number };
}

interface Consts {
    maxNumberHarvester : number;
    maxNumberUpgrader : number;
    maxNumberBuilder : number;
    maxNumberRepairer : number;
    maxNumberCarrier : number;
    maxNumberPioneer : number;
    maxNumberPillager : number;
    maxNumberSoldier : number;
    maxNumberDiplomats : number;
    maxNumberCarrierTeleporter : number;
    maxNumberMeleeFightersForAnotherRoom : number;
    // Roles.
    roleBuilder : string;
    roleCarrier : string;
    roleCarrierTeleporter : string;
    roleHarvester : string;
    roleMiner : string;
    roleMinerLinker  : string;
    roleRepairer : string;
    roleUpgrader : string;
    rolePioneer : string;
    rolePillager : string;
    roleSoldier : string;
    rolefighterHealer : string;
    roleFighterMelee : string;
    roleFighterMeleeForAnotherRoom : string;
    roleFighterRanged : string;
    roleDiplomat : string;
    // Room config.
    roomLevelCanCreatePioneers : number;
    roomLevelCanReceivePioneers : number;
    // Creep repair.
    minTicksBeforeRepairing : number;
    minTicksBeforeSpawningReplacement : number;
    shouldRenewCreeps : boolean;
    // Misc.
    garbageCollectionInterval : string;
    towerRepairSleepTimer : string;
}
