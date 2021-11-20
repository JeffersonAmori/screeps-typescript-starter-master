export class RoleMiner {

    /** @param {Creep} creep **/
    public static run(creep: Creep): void {
        var source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (!source)
            return;

        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
            const creepContainer = Game.getObjectById<Structure>(creep.memory.myContainerId);
            if (!creepContainer)
                return;

            creep.moveTo(creepContainer);
        }
    }
};
