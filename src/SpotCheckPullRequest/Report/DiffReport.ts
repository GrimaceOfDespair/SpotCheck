export interface IDiffTestRun {
    total: number,
    totalPassed: number,
    totalFailed: number,
    totalSuites: number,
    suites: IDiffSuite[]
}

export interface IDiffSuite {
    name: string;
    path: string;
    tests: IDiffTest[];
}

export interface IDiffTest {
    name: string;
    specPath: string;
    specFilename: string;
    status: 'pass' | 'fail';
    percentage: number;
    failureThreshold: number;
    baselinePath: string;
    comparisonPath: string;
    diffPath: string;
}
