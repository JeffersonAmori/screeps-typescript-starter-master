interface Memory {
  profiler: ProfilerMemory;
}

interface ProfilerMemory {
  map: { [name: string | symbol]: ProfilerData };
  start?: number;
  total: number;
}

interface ProfilerData {
  calls: number;
  time: number;
}

interface Profiler {
  clear(): void;
  output(): void;
  start(): void;
  status(): void;
  stop(): void;
}

declare const __PROFILER_ENABLED__: boolean;
