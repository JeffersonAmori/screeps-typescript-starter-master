// import { Consts } from "consts";

// export class MyStructureSpawn {
//     public static trySpawnCreep(spawn: StructureSpawn, bodyParts: BodyPartConstant[], role: string): void {
//         let ret = spawn.spawnCreep(bodyParts, role + '-' + Math.random().toString(36).substr(2, 5),
//             { memory: { role: role, working: false, room: spawn.room.name, otherResources: [], myContainerId: '' } });
//         // console.log(role + '-' + ret);
//     }

//     public static tryCreateCreep(role: string, maxNumberOfCreeps: number) {
//         for (var spawn in Game.spawns) {
//             const creeps = _.filter(Game.spawns[spawn].room.find(FIND_MY_CREEPS), (c) => c.memory.role == role);
//             //console.log('role: ' + role + ' | ' + 'count: ' + creepCount + ' | Max number of creeps: ' + maxNumberOfCreeps);
//             if (creeps.length < maxNumberOfCreeps) {
//                 let creepBody;
//                 if (creeps.length < 1 && maxNumberOfCreeps > 1) {
//                     creepBody = Consts.bodyLevel1;
//                 } else if (creeps.length < (maxNumberOfCreeps / 2) && maxNumberOfCreeps > 1) {
//                     creepBody = Consts.bodyLevel2;
//                 } else if (creeps.length < maxNumberOfCreeps) {
//                     creepBody = Consts.bodyLevel3;
//                 }

//                 if (!creepBody)
//                     return;

//                 //console.log('role: ' + role + ' | ' + 'count: ' + creepCount + ' | Max number of creeps: ' + maxNumberOfCreeps + ' | Parts: ' + creepBody);
//                 MyStructureSpawn.trySpawnCreep(Game.spawns[spawn], creepBody, role);
//             }
//         }
//     }
// }
