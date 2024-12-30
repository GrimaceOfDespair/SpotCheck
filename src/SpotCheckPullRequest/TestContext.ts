import { IDiffSuite, IDiffTest } from "./Report/DiffReport";

export interface ITestContext {
    suiteStack: string[];
    test: string;
    args: string[];
    status: TestStatus; 
    source: string;
}

export type TestStatus = 'PASS' | 'PASS' | 'NOT RUN';