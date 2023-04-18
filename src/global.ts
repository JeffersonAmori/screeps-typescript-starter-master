declare var log: any;
declare var Profiler: Profiler;
declare var kernel: any;
declare var GlobalMemory: any;
declare var KernelMemory: KernelMemory;

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
