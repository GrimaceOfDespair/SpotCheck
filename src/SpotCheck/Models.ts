
export interface IPanelContentState {
    report?: IReport;
}
export interface IReport {
    total: number;
    totalFailed: number;
    totalPassed: number;
    totalSuites: number;
    suites: ISuite[];
}
export interface ISuite {
    name: string;
    path: string;
    pass: number;
    fail: number;
    tests: ITest[];
}
interface IScreenshot {
    path: string;
    artifactName: string;
    url: string;
}
export interface ITest {
    name: string;
    specPath: string;
    specFilename: string;
    status: string;
    pass: boolean;
    percentage: number;
    failureThreshold: number;
    baselinePath: string;
    comparisonPath: string;
    diffPath: string;
    baseline: IScreenshot;
    comparison: IScreenshot;
    diff: IScreenshot;
}
