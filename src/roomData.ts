export class RoomData {
    public sumOfDistancesToSourcesFromSpawnHeuristic?: number = 0;
    public storageLinkId?: string | null = null;
    public upgraderContainerId?: string | null = null;
    public towerRepairProcessId?: number | null = null;
    public mayorProcessId?: number | null = null;
    public motherProcessId?: number | null = null;
    public noActiveResourceHarvest?: boolean = false;
    public sheriffProcessId?: number | null = null;
    public spawnCreepQueue: string[] = [];
    public processes: { [id: string]: number } = {};
}
