export class BlueprintItem {
    public structure: BuildableStructureConstant;
    public x: number;
    public y: number;
    public controllerLevel: number;

    constructor(structure: BuildableStructureConstant, x: number, y: number, controllerLevel: number) {
        this.structure = structure;
        this.x = x;
        this.y = y;
        this.controllerLevel = controllerLevel;

    }
}



export class Architect {
    static bluprintSize: number = 13;
    static blueprint: BlueprintItem[] =
        [
            // line 1
            new BlueprintItem(STRUCTURE_ROAD, -5, -6, 8),
            new BlueprintItem(STRUCTURE_ROAD, -4, -6, 8),
            new BlueprintItem(STRUCTURE_ROAD, -3, -6, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -2, -6, 8),
            new BlueprintItem(STRUCTURE_ROAD, -1, -6, 6),
            new BlueprintItem(STRUCTURE_ROAD, 0, -6, 6),
            new BlueprintItem(STRUCTURE_ROAD, 1, -6, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, 2, -6, 6),
            new BlueprintItem(STRUCTURE_ROAD, 3, -6, 5),
            new BlueprintItem(STRUCTURE_ROAD, 4, -6, 5),
            new BlueprintItem(STRUCTURE_ROAD, 5, -6, 5),
            // line 2
            new BlueprintItem(STRUCTURE_ROAD, -6, -5, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -5, -5, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -4, -5, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -3, -5, 8),
            new BlueprintItem(STRUCTURE_ROAD, -2, -5, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -1, -5, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, 0, -5, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, 1, -5, 6),
            new BlueprintItem(STRUCTURE_ROAD, 2, -5, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, -5, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, 4, -5, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, -5, 6),
            new BlueprintItem(STRUCTURE_ROAD, 6, -5, 5),
            // line 3
            new BlueprintItem(STRUCTURE_ROAD, -6, -4, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -5, -4, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -4, -4, 8),
            new BlueprintItem(STRUCTURE_ROAD, -3, -4, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -2, -4, 8),
            new BlueprintItem(STRUCTURE_ROAD, -1, -4, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, 0, -4, 6),
            new BlueprintItem(STRUCTURE_ROAD, 1, -4, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 2, -4, 5),
            new BlueprintItem(STRUCTURE_ROAD, 3, -4, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 4, -4, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, -4, 5),
            new BlueprintItem(STRUCTURE_ROAD, 6, -4, 5),
            // line 4
            new BlueprintItem(STRUCTURE_ROAD, -6, -3, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -5, -3, 8),
            new BlueprintItem(STRUCTURE_ROAD, -4, -3, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -3, -3, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -2, -3, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, -1, -3, 6),
            new BlueprintItem(STRUCTURE_ROAD, 0, -3, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, 1, -3, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 2, -3, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, -3, 5),
            new BlueprintItem(STRUCTURE_ROAD, 4, -3, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, -3, 5),
            new BlueprintItem(STRUCTURE_ROAD, 6, -3, 5),
            // line 5
            new BlueprintItem(STRUCTURE_EXTENSION, -6, -2, 7),
            new BlueprintItem(STRUCTURE_ROAD, -5, -2, 7),
            new BlueprintItem(STRUCTURE_EXTENSION, -4, -2, 7),
            new BlueprintItem(STRUCTURE_EXTENSION, -3, -2, 7777),
            new BlueprintItem(STRUCTURE_EXTENSION, -2, -2, 6),
            new BlueprintItem(STRUCTURE_ROAD, -1, -2, 6),
            new BlueprintItem(STRUCTURE_SPAWN, 0, -2, 8),
            new BlueprintItem(STRUCTURE_ROAD, 1, -2, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 2, -2, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, -2, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 4, -2, 5),
            new BlueprintItem(STRUCTURE_ROAD, 5, -2, 2),
            new BlueprintItem(STRUCTURE_EXTENSION, 6, -2, 5),
            // line 6
            new BlueprintItem(STRUCTURE_ROAD, -6, -1, 7),
            new BlueprintItem(STRUCTURE_EXTENSION, -5, -1, 7),
            new BlueprintItem(STRUCTURE_ROAD, -4, -1, 7),
            new BlueprintItem(STRUCTURE_EXTENSION, -3, -1, 7),
            new BlueprintItem(STRUCTURE_ROAD, -2, -1, 6),
            new BlueprintItem(STRUCTURE_TOWER, -1, -1, 8),
            new BlueprintItem(STRUCTURE_TOWER, 0, -1, 7),
            new BlueprintItem(STRUCTURE_TOWER, 1, -1, 5),
            new BlueprintItem(STRUCTURE_ROAD, 2, -1, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, -1, 4),
            new BlueprintItem(STRUCTURE_ROAD, 4, -1, 2),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, -1, 2),
            new BlueprintItem(STRUCTURE_ROAD, 6, -1, 2),
            // line 7 -- middle line
            new BlueprintItem(STRUCTURE_ROAD, -6, 0, 7),
            new BlueprintItem(STRUCTURE_EXTENSION, -5, 0, 7),
            new BlueprintItem(STRUCTURE_EXTENSION, -4, 0, 7),
            new BlueprintItem(STRUCTURE_ROAD, -3, 0, 6),
            new BlueprintItem(STRUCTURE_SPAWN, -2, 0, 7),
            new BlueprintItem(STRUCTURE_TOWER, -1, 0, 7),
            new BlueprintItem(STRUCTURE_TOWER, 1, 0, 3),
            new BlueprintItem(STRUCTURE_SPAWN, 2, 0, 1),
            new BlueprintItem(STRUCTURE_ROAD, 3, 0, 2),
            new BlueprintItem(STRUCTURE_EXTENSION, 4, 0, 2),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, 0, 2),
            new BlueprintItem(STRUCTURE_ROAD, 6, 0, 2),
            // line 8
            new BlueprintItem(STRUCTURE_ROAD, -6, 1, 7),
            new BlueprintItem(STRUCTURE_EXTENSION, -5, 1, 7),
            new BlueprintItem(STRUCTURE_ROAD, -4, 1, 6),
            new BlueprintItem(STRUCTURE_ROAD, -2, 1, 6),
            new BlueprintItem(STRUCTURE_EXTENSION, -1, 1, 7),
            new BlueprintItem(STRUCTURE_TOWER, 0, 1, 8),
            new BlueprintItem(STRUCTURE_EXTENSION, 1, 1, 5),
            new BlueprintItem(STRUCTURE_ROAD, 2, 1, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, 1, 2),
            new BlueprintItem(STRUCTURE_ROAD, 4, 1, 2),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, 1, 2),
            new BlueprintItem(STRUCTURE_ROAD, 6, 1, 2),
            // line 9
            new BlueprintItem(STRUCTURE_EXTENSION, -6, 2, 7),
            new BlueprintItem(STRUCTURE_ROAD, -5, 2, 6),
            new BlueprintItem(STRUCTURE_LAB, -4, 2, 6),
            new BlueprintItem(STRUCTURE_LAB, -3, 2, 6),
            new BlueprintItem(STRUCTURE_TERMINAL, -2, 2, 6),
            new BlueprintItem(STRUCTURE_ROAD, -1, 2, 6),
            new BlueprintItem(STRUCTURE_POWER_SPAWN, 0, 2, 8),
            new BlueprintItem(STRUCTURE_ROAD, 1, 2, 3),
            new BlueprintItem(STRUCTURE_LINK, 2, 2, 5),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, 2, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 4, 2, 3),
            new BlueprintItem(STRUCTURE_ROAD, 5, 2, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 6, 2, 4),
            // line 10
            new BlueprintItem(STRUCTURE_ROAD, -6, 3, 8),
            new BlueprintItem(STRUCTURE_LAB, -5, 3, 8),
            new BlueprintItem(STRUCTURE_ROAD, -4, 3, 6),
            new BlueprintItem(STRUCTURE_LAB, -3, 3, 6),
            new BlueprintItem(STRUCTURE_LAB, -2, 3, 7),
            new BlueprintItem(STRUCTURE_ROAD, 0, 3, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 2, 3, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, 3, 3),
            new BlueprintItem(STRUCTURE_ROAD, 4, 3, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, 3, 4),
            new BlueprintItem(STRUCTURE_ROAD, 6, 3, 4),
            // line 11
            new BlueprintItem(STRUCTURE_ROAD, -6, 4, 8),
            new BlueprintItem(STRUCTURE_LAB, -5, 4, 8),
            new BlueprintItem(STRUCTURE_LAB, -4, 4, 7),
            new BlueprintItem(STRUCTURE_ROAD, -3, 4, 6),
            new BlueprintItem(STRUCTURE_LAB, -2, 4, 7),
            new BlueprintItem(STRUCTURE_ROAD, -1, 4, 6),
            new BlueprintItem(STRUCTURE_STORAGE, 0, 4, 4),
            new BlueprintItem(STRUCTURE_ROAD, 1, 4, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 2, 4, 3),
            new BlueprintItem(STRUCTURE_ROAD, 3, 4, 3),
            new BlueprintItem(STRUCTURE_EXTENSION, 4, 4, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, 4, 4),
            new BlueprintItem(STRUCTURE_ROAD, 6, 4, 4),
            // line 12
            new BlueprintItem(STRUCTURE_ROAD, -6, -5, 8),
            new BlueprintItem(STRUCTURE_OBSERVER, -5, -5, 8),
            new BlueprintItem(STRUCTURE_LAB, -4, -5, 8),
            new BlueprintItem(STRUCTURE_LAB, -3, -5, 8),
            new BlueprintItem(STRUCTURE_ROAD, -2, -5, 6),
            new BlueprintItem(STRUCTURE_ROAD, 2, -5, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 3, -5, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 4, -5, 4),
            new BlueprintItem(STRUCTURE_EXTENSION, 5, -5, 4),
            new BlueprintItem(STRUCTURE_ROAD, 6, -5, 4),
            // line 13
            new BlueprintItem(STRUCTURE_ROAD, -5, -6, 8),
            new BlueprintItem(STRUCTURE_ROAD, -4, -6, 8),
            new BlueprintItem(STRUCTURE_ROAD, -3, -6, 8),
            new BlueprintItem(STRUCTURE_NUKER, 0, -6, 8),
            new BlueprintItem(STRUCTURE_ROAD, 3, -6, 4),
            new BlueprintItem(STRUCTURE_ROAD, 4, -6, 4),
            new BlueprintItem(STRUCTURE_ROAD, 5, -6, 4),
        ];


    public static RoomCanFitBase(room: Room): boolean {
        const roomTerrain: RoomTerrain = room.getTerrain();
        let fits = true;

        for (let lastKnowLine = 0; lastKnowLine <= 49; lastKnowLine++) {
            for (let lastKnowColumn = 0; lastKnowColumn <= 49; lastKnowColumn++) {

                for (let line = lastKnowLine; line <= Architect.bluprintSize; line++) {
                    for (let column = lastKnowColumn; line <= Architect.bluprintSize; column++) {
                        const terrain = roomTerrain.get(line, column);
                        if (terrain === TERRAIN_MASK_WALL) {
                            fits = false;
                            break;
                        }
                    }
                }
            }
        }

        return fits;
    }
}
