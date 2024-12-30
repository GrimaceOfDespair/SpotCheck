import { IDiffSuite, IDiffTest } from "./Report/DiffReport";

export interface ITestContext {
    suiteStack: string[];
    test: string;
    keyword: string;
    source?: string;
}