import { GlobalMemory } from "GlobalMemory";
import { Architect } from "meta/architect";
import { Overlord } from "meta/Overlord";
import { ErrorMapper } from "utils/ErrorMapper";
import { MachineState, StateMachine } from "when-ts";
import { UpdateAllOwnedRoomsInfoProcess } from "OS/processes/global/updateAllOwnedRoomsInfoProcess";
import { garbageCollectionProcess } from "OS/processes/memory/garbageCollection";
import { ProcessPriority } from "OS/kernel/constants";
import * as Profiler from "libs/Profiler-ts/Profiler";
import * as kernel from "OS/kernel/kernel"
import { PlanRunProcess } from "libs/GlitchAssassin/RoomPlanner/planRooms";

declare global {
    /*
      Example types, expand on these or remove them and add your own.
      Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

      Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
      Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
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
    }

    interface Memory {
        RoomsInfo: string;
        Started: boolean;
        RunArchitect: boolean;
    }

    interface CreepMemory {
        forceMoveToTargetContainer?: boolean;
        isRenewing?: boolean;
        otherResources?: ResourceConstant[];
        linkReadyForActivation?: boolean;
        role?: string;
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

    interface CreepState extends MachineState {
        creep: Creep;
    }

    interface CreepProcessState extends MachineState {
        state: number;
        creep: Creep;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS {
        interface Global {
            log: any;
            Profiler: Profiler;
            kernel: any;
            GlobalMemory:any;
        }
    }
}

global.Profiler = Profiler.init();
global.kernel = kernel;
global.GlobalMemory = GlobalMemory;

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code

export const loop = ErrorMapper.wrapLoop(() =>
//profiler.wrap(() =>
{
    LoadMemory();
    kernel.run();

    console.log(`Current game tick is ${Game.time}`);

    if (Memory.RunArchitect) {
        Memory.RunArchitect = false;
        console.log(Architect.RoomCanFitBunker(Game.rooms['E31S54']));
    }

    try {
        // if (Game.creeps.Jeff.room != Game.flags.attackFlag.room) {
        //     Game.creeps.Jeff.moveTo(Game.flags.attackFlag);
        // } else {
        //     var hostilesStructure = Game.creeps.Jeff.room.find(FIND_HOSTILE_STRUCTURES)[0];
        //     if (hostilesStructure)
        //         if (Game.creeps.Jeff.attack(hostilesStructure) == ERR_NOT_IN_RANGE) {
        //             Game.creeps.Jeff.moveTo(hostilesStructure);
        //         }
        // else {
        //     let structures = Game.creeps.Jeff.room.find(FIND_STRUCTURES, {
        //         filter: (s) => (s.hits == 1 && s.structureType == STRUCTURE_WALL)
        //     });

        //     if (!structures)
        //         return;

        //     let targetStructure = Game.creeps.Jeff.pos.findClosestByRange(structures);
        //     if (targetStructure)
        //         if (Game.creeps.Jeff.attack(targetStructure) == ERR_NOT_IN_RANGE)
        //             Game.creeps.Jeff.moveTo(targetStructure);
        // }
        // }
        // }

        // Game.creeps.Jeff.moveTo(spawn);

        // if (Game.creeps.Diplo.room != Game.flags.claimFlag.room)
        //     Game.creeps.Diplo.moveTo(Game.flags.claimFlag);
        // else {
        //     const controller = Game.creeps.Diplo.room.controller;

        //     if (controller) {
        //         let ret = Game.creeps.Diplo.claimController(controller);
        //         console.log(ret);
        //         if (ret == ERR_NOT_IN_RANGE)
        //             Game.creeps.Diplo.moveTo(controller);
        //     }
        // }

        // if (Game.creeps.Lolito.room != Game.flags.center.room)
        //     Game.creeps.Lolito.moveTo(Game.flags.center);

    }
    catch { }

    kernel.addProcessIfNotExists(new UpdateAllOwnedRoomsInfoProcess(0, 0));
    kernel.addProcessIfNotExists(new garbageCollectionProcess(0, 0));
    kernel.addProcessIfNotExists(new Overlord(0, 0, ProcessPriority.Ticly));
    kernel.addProcessIfNotExists(new PlanRunProcess(0, 0));

    SaveMemory();
    //})
});

function LoadMemory() {
    kernel.loadProcessTable();
    GlobalMemory.RoomInfo = JSON.parse(Memory.RoomsInfo);
}

function SaveMemory() {
    Memory.RoomsInfo = JSON.stringify(GlobalMemory.RoomInfo);
    kernel.storeProcessTable();
}

function CleanMemory() {
}
