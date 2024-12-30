export interface IRobotSuite {
    name: string;
    path: string;
    tests: IRobotTest[];
}

export interface IRobotTest {
    test: string;
    suite: string;
    source: string;
    imageName: string;
    imageThreshold: string;
    imageFolder: string;
}

export interface IRobotSuites {
    [suite: string]: IRobotTest[];
}