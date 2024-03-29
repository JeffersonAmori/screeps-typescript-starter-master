import { ProcessPriority } from "OS/kernel/constants";
import * as kernel from "OS/kernel/kernel";
import { UpdateAllOwnedRoomsInfoProcess } from "OS/processes/global/updateAllOwnedRoomsInfoProcess";
import { garbageCollectionProcess } from "OS/processes/memory/garbageCollection";
import * as Profiler from "libs/Profiler-ts/Profiler";
import { Architect } from "meta/Architect";
import { Overlord } from "meta/Overlord";
import { ErrorMapper } from "utils/ErrorMapper";

declare global {
    /*
      Example types, expand on these or remove them and add your own.
      Note: Values, properties defined here do no fully *exist* by this type definiton alone.
            You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

      Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
      Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
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
    //kernel.addProcessIfNotExists(new PlanRunProcess(0, 0));

    SaveMemory();
    //})
});

function LoadMemory() {
    kernel.loadProcessTable();
    if (Memory.RoomsInfo.length > 0) {
        GlobalMemory.RoomInfo = JSON.parse(Memory.RoomsInfo);
    }
    Memory.kernelMemory = Memory.kernelMemory || {  printProcess: false};
}

function SaveMemory() {
    Memory.RoomsInfo = JSON.stringify(GlobalMemory.RoomInfo);
    kernel.storeProcessTable();
}
