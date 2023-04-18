import { Process } from "./process";

export class DummyProcess extends Process {
    public setup(..._: any[]): Process {
        throw this;
    }
    public classPath(): string {
        return "DummyProcess";
    }

    public run(): number {
        return 0;
    }
}

