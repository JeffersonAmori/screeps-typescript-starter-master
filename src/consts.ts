export class Consts {
    public static maxNumberHarvester = 0;
    public static maxNumberUpgrader = 5;
    public static maxNumberUpgradersForAnotherRoom = 1;
    public static maxNumberBuilder = 3;
    public static maxNumberBuilderForAnotherRoom = 2;
    public static maxNumberRepairer = 1;
    public static maxNumberCarrier = 4;

    public static roleBuilder = 'builder';
    public static roleBuilderForAnotherRoom = 'builderForAnotherRoom';
    public static roleCarrier = 'carrier';
    public static roleHarvester = 'harvester';
    public static roleMiner = 'miner';
    public static roleRepairer = 'repairer';
    public static roleUpgrader = 'upgrader';
    public static roleUpgraderForAnotherRoom = 'upgraderForAnotherRoom';
    public static rolefighterHealer = 'harvester';
    public static roleFighterMelee = 'meleeFighter';
    public static roleFighterRanged = 'rangedFighter';

    public static bodyLevel1 = [WORK, CARRY, MOVE, MOVE];
    public static bodyLevel2 = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
    public static bodyLevel3 = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    public static meleeFighterBody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    public static rangedFighterBody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    public static healerFighterBody = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    public static harvesterStandStillBody = [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE];
    public static carrierBody = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
    //public static carrierBody = [CARRY, CARRY, MOVE, MOVE];
    public static upgraderBody = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];

    public static topContainerId = '619411f334dca3036bdc435f';
    public static bottomContainerId = '6193f73d27ccd4567c91516f';
};
